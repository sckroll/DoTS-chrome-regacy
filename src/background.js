/* eslint-disable prettier/prettier */

// 크롤링 제외 사이트
const exceptedPages = [
	'chrome://*',
	'file://*',
	'*://localhost:*',
	'*dots-00.appspot.com*',
	'*console.cloud.google.com*'
]

const dotsURL = process.env.NODE_ENV === 'production' ? 'https://dots-00.appspot.com/*' : 'http://localhost:8080/*'

// 와일드카드 적용 함수
// https://stackoverflow.com/questions/26246601/wildcard-string-comparison-in-javascript
function matchWildcard(str, rule) {
  var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

// DoTS 사이트로부터 오는 JWT 로그인 토큰 처리
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.currProject) {
    localStorage.setItem("currProject", request.currProject)
  }

  if (request.userToken) {
	  if (request.userToken !== 'logout') {
      localStorage.setItem("userToken", request.userToken)
      sendResponse({ result: "Token connected" });
    } else {
      localStorage.removeItem("userToken")
      sendResponse({ result: "Token disconnected" });
    }
  }

  return true
});

// 탭을 이동할 때마다 이전 URL와 현재 URL을 백엔드로 전달
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete') {
		var isExcepted = false

		// 크롤링 제외 사이트 목록에 포함되어 있는지 검사
		exceptedPages.forEach(val => {
			if (matchWildcard(tab.url, val)) {
				isExcepted = true
			}
		})

		if (!isExcepted) {
			chrome.tabs.executeScript(tabId, {
				code: 'document.referrer;'
			}, referrer => {
				console.log('prevURL: ' + referrer)
				console.log('currURL: ' + tab.url)

				chrome.tabs.query({
					url: ['*://www.google.com/search?*', '*://www.google.co.kr/search?*'],
					currentWindow: true
				}, result => {
					var tabInfo = []
					for (var i = 0; i < result.length; i++) {
						var info = {
							id: result[i].id,
							url: result[i].url
						}
						tabInfo.push(info)
					}

					// axios 대신 onMessageExternal 사용
					// DoTS 사이트로 prevURL과 currURL 전달
					chrome.tabs.query({url: dotsURL, currentWindow: true}, results => {
						chrome.tabs.sendMessage(results[0].id, { tabId, tabInfo, prevURL: referrer[0], currURL: tab.url })
					})
				})
			})
		}
	}
})

// 새 탭을 연 링크가 존재하는 탭의 ID를 DoTS 사이트의 content-script로 전달
chrome.webNavigation.onCreatedNavigationTarget.addListener(result => {
	var tabId = result.sourceTabId
	var isExcepted = false
	console.log(tabId)

	chrome.tabs.get(tabId, tab => {
		// 크롤링 제외 사이트 목록에 포함되어 있는지 검사
		exceptedPages.forEach(val => {
			if (matchWildcard(tab.url, val)) {
				isExcepted = true
			}
		})

		if (!isExcepted) {
			chrome.tabs.query({url: dotsURL, currentWindow: true}, results => {
				chrome.tabs.sendMessage(results[0].id, { tabId })
			})
		}
	})
})
