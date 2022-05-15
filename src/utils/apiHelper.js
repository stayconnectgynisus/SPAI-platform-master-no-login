import env from "../evn";


export default async function APIHelper(url, options) {
  var  reqURI = env.baseUrl + url;

  return fetch(reqURI, options).then((response) => {
    if (response.status == 401) {
      //localStorage.clear();
      sessionStorage.clear();
      // window.location.reload();
      return [];
      //return <Redirect to="/login" />;
    } else return response.json();
  });
}
