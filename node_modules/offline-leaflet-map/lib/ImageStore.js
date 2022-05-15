var ImageStore, IndexedDBDataStorage, WebSQLDataStorage, async;

async = require('async');

IndexedDBDataStorage = require('./IndexedDBDataStorage');

WebSQLDataStorage = require('./WebSQLDataStorage');

module.exports = ImageStore = (function() {
  function ImageStore(eventEmitter, imageRetriever) {
    if (imageRetriever == null) {
      throw new Error('the image store needs an imageRetriever');
    }
    if (eventEmitter == null) {
      throw new Error('the image store needs an eventEmitter');
    }
    this._eventEmitter = eventEmitter;
    this._nbTilesLeftToSave = 0;
    this._nbImagesCurrentlyBeingRetrieved = 0;
    this._imageRetriever = imageRetriever;
    this._myQueue = null;
    this._beingCanceled = false;
    this._running = false;
  }

  ImageStore.prototype.createDB = function(storeName, onReady, onError, useWebSQL) {
    var _useWebSQL;
    _useWebSQL = useWebSQL;
    if (onReady == null) {
      throw new Error('This async function needs a callback');
    }
    if (!_useWebSQL) {
      return this.storage = new IndexedDBDataStorage(storeName, onReady, onError);
    } else {
      return this.storage = new WebSQLDataStorage(storeName, onReady, onError);
    }
  };

  ImageStore.prototype.cancel = function() {
    if (!this._running) {
      return false;
    }
    if (this._beingCanceled) {
      return true;
    }
    this._beingCanceled = true;
    if (this._myQueue != null) {
      this._myQueue.kill();
      if (this._nbImagesCurrentlyBeingRetrieved === 0) {
        this._finish();
      }
      return true;
    }
    return false;
  };

  ImageStore.prototype.isBusy = function() {
    return this._running;
  };

  ImageStore.prototype.get = function(key, onSuccess, onError) {
    if ((onSuccess == null) || (onError == null)) {
      throw new Error('This async function needs callbacks');
    }
    return this.storage.get(key, onSuccess, onError);
  };

  ImageStore.prototype.clear = function(onSuccess, onError) {
    if ((onSuccess == null) || (onError == null)) {
      throw new Error('This async function needs callbacks');
    }
    return this.storage.clear(onSuccess, onError);
  };

  ImageStore.prototype._finish = function(error, onError) {
    this._running = false;
    this._beingCanceled = false;
    this._eventEmitter.fire('tilecachingprogressdone', null);
    this._myQueue = null;
    this._nbImagesCurrentlyBeingRetrieved = 0;
    if (error != null) {
      return onError(error);
    } else {
      return this._onSaveImagesSuccess();
    }
  };

  ImageStore.prototype.saveImages = function(tileImagesToQuery, onStarted, onSuccess, onError) {
    this._running = true;
    if (this._myQueue != null) {
      throw new Error('Not allowed to save images while saving is already in progress');
    }
    if ((onStarted == null) || (onSuccess == null) || (onError == null)) {
      throw new Error('This async function needs callbacks');
    }
    this._onSaveImagesSuccess = onSuccess;
    return this._getImagesNotInDB(tileImagesToQuery, (function(_this) {
      return function(tileInfoOfImagesNotInDB) {
        var MAX_NB_IMAGES_RETRIEVED_SIMULTANEOUSLY, data, j, len;
        if (!_this._beingCanceled && (tileInfoOfImagesNotInDB != null) && tileInfoOfImagesNotInDB.length > 0) {
          MAX_NB_IMAGES_RETRIEVED_SIMULTANEOUSLY = 8;
          _this._myQueue = async.queue(function(data, callback) {
            return _this._saveTile(data, callback);
          }, MAX_NB_IMAGES_RETRIEVED_SIMULTANEOUSLY);
          _this._myQueue.drain = function(error) {
            return _this._finish(error, onError);
          };
          for (j = 0, len = tileInfoOfImagesNotInDB.length; j < len; j++) {
            data = tileInfoOfImagesNotInDB[j];
            _this._myQueue.push(data);
          }
          return onStarted();
        } else {
          onStarted();
          return _this._finish();
        }
      };
    })(this), function(error) {
      return onError(error);
    });
  };

  ImageStore.prototype._getImagesNotInDB = function(tileImagesToQuery, callback, onError) {
    var imageKey, tileImagesToQueryArray;
    tileImagesToQueryArray = [];
    for (imageKey in tileImagesToQuery) {
      tileImagesToQueryArray.push(imageKey);
    }
    return this.storage.getDenseBatch(tileImagesToQueryArray, (function(_this) {
      return function(tileImages) {
        var i, j, len, testTile, tileImage, tileInfoOfImagesNotInDB;
        i = 0;
        tileInfoOfImagesNotInDB = [];
        _this._eventEmitter.fire('tilecachingstart', null);
        _this._nbTilesLeftToSave = 0;
        testTile = function(tileImage) {
          var key, tileInfo;
          if (!tileImage) {
            key = tileImagesToQueryArray[i];
            tileInfo = tileImagesToQuery[key];
            _this._nbTilesLeftToSave++;
            tileInfoOfImagesNotInDB.push({
              key: key,
              tileInfo: tileInfo
            });
          }
          return i++;
        };
        for (j = 0, len = tileImages.length; j < len; j++) {
          tileImage = tileImages[j];
          testTile(tileImage);
        }
        _this._updateTotalNbImagesLeftToSave(_this._nbTilesLeftToSave);
        return callback(tileInfoOfImagesNotInDB);
      };
    })(this), function(error) {
      return onError(error);
    });
  };

  ImageStore.prototype._saveTile = function(data, callback) {
    var errorGettingImage, gettingImage;
    gettingImage = (function(_this) {
      return function(response) {
        return _this.storage.put(data.key, {
          "image": response
        }, function() {
          _this._decrementNbTilesLeftToSave();
          return callback();
        }, function(error) {
          _this._decrementNbTilesLeftToSave();
          return callback(error);
        });
      };
    })(this);
    errorGettingImage = (function(_this) {
      return function(errorType, errorData) {
        _this._decrementNbTilesLeftToSave();
        _this._eventEmitter._reportError(errorType, {
          data: errorData,
          tileInfo: data.tileInfo
        });
        return callback(errorType);
      };
    })(this);
    this._nbImagesCurrentlyBeingRetrieved++;
    return this._imageRetriever.retrieveImage(data.tileInfo, gettingImage, errorGettingImage);
  };

  ImageStore.prototype._updateTotalNbImagesLeftToSave = function(nbTiles) {
    this._nbTilesLeftToSave = nbTiles;
    return this._eventEmitter.fire('tilecachingprogressstart', {
      nbTiles: this._nbTilesLeftToSave
    });
  };

  ImageStore.prototype._decrementNbTilesLeftToSave = function() {
    this._nbTilesLeftToSave--;
    if (!this._beingCanceled) {
      this._eventEmitter.fire('tilecachingprogress', {
        nbTiles: this._nbTilesLeftToSave
      });
    }
    this._nbImagesCurrentlyBeingRetrieved--;
    if (this._beingCanceled && this._nbImagesCurrentlyBeingRetrieved === 0) {
      return this._finish();
    }
  };

  return ImageStore;

})();
