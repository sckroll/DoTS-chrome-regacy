chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.userToken) {
    console.log(request.userToken)
    localStorage.setItem("userToken", request.userToken)
    sendResponse({ result: "Token connected" });
  } else {
    localStorage.removeItem("userToken")
    sendResponse({ result: "Token disconnected" });
  }
});
