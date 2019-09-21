/* eslint-disable prettier/prettier */

// 로컬 저장소 이벤트를 같은 탭에서도 발생하도록 수정
// https://www.experts-exchange.com/questions/29143892/How-to-Set-JavaScript-Event-Listener-on-Local-Storage-Value-in-Same-Window.html
// Storage.prototype._setItem = Storage.prototype.setItem;
// Storage.prototype.setItem = function(key, value)
// {
//   var evt = new CustomEvent('storagechange', {detail: {type: 'set', key: key, value: value}});
//   window.dispatchEvent(evt);
//   this._setItem(key, JSON.stringify(value));
// }

// Storage.prototype._getItem = Storage.prototype.getItem;
// Storage.prototype.getItem = function(key)
// { 
//   var evt = new CustomEvent('storagechange', {detail: {type: 'get', key: key}});
//   window.dispatchEvent(evt);
//   return this._getItem(key);
// }

// window.addEventListener('storagechange', function(e) {
//   if (e.detail.type == 'set') {
//     console.log('LocalStorage value' + e.detail.key + ' set to ' + e.detail.value);
//   }
//   else {
//     console.log('LocalStorage value' + e.detail.key + ' retrieved');
//   }
// });

// window.addEventListener('load', function() {
//   localStorage.setItem('test', '123');
//   var x = localStorage.getItem('test');
// });

localStorage.setItem('tabId', '')
localStorage.setItem('tabInfo', '')
localStorage.setItem('prevURL', '')
localStorage.setItem('currURL', '')
localStorage.setItem('openerTabId', '')

// Difference between two arrays of objects in JavaScript
// https://stackoverflow.com/questions/21987909/how-to-get-the-difference-between-two-arrays-of-objects-in-javascript
function comparer(otherArray){
	return function(current){
		return otherArray.filter(function(other){
			return other.id == current.id && other.url == current.url
		}).length == 0;
	}
}

// 페이지를 이동할 때마다 이전 URL과 현재 URL을 전달받아 로컬 저장소에 저장
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(request);

	if (request.tabInfo) {
		var currTabInfo = request.tabInfo
		var prevTabInfoStr = localStorage.getItem('tabInfo')
		var prevURL = request.prevURL
	
		if (prevTabInfoStr !== '') {
			var prevTabInfo = JSON.parse(prevTabInfoStr)
			
			var onlyInPrev = prevTabInfo.filter(comparer(currTabInfo));
			var onlyInCurr = currTabInfo.filter(comparer(prevTabInfo));
			
			console.log(onlyInPrev)
			console.log(onlyInCurr)

			if (onlyInPrev.length > onlyInCurr.length) {
				// prev에 요소가 존재할 경우

				if (request.tabId === onlyInPrev[0].id) {
					// tabId가 같다면 구글 -> 웹 페이지

					prevURL = onlyInPrev[0].url
				} else {
					// tabId가 다르다면 탭 종료

					prevURL = request.prevURL
				}
			} else if (onlyInPrev.length < onlyInCurr.length) {
				// curr에 요소가 존재한다면 웹 페이지 -> 구글 or 구글 새 페이지

				prevURL = request.prevURL
			} else {
				if (onlyInPrev.length === 1 && onlyInCurr.length === 1) {
					// 둘 다 요소가 존재한다면 다음 검색 결과 페이지로 이동한 경우

					prevURL = onlyInPrev[0].url
				} else {
					// 둘 다 요소가 없다면

					var prevTabId = localStorage.getItem('tabId')
					var openerTabId = localStorage.getItem('openerTabId')
	
					if (prevTabId !== request.tabId) {
						// 페이지 갱신 전후의 tabId가 다르다면 새 탭에서 웹 페이지 생성

						if (request.prevURL.indexOf('www.google') !== -1) {
							// 구글 검색 결과 페이지에서 새 탭을 열였을 경우
							// 해당 결과 페이지의 URL을 이전 URL로 사용

							var newReferrer = currTabInfo.find(result => {
								console.log('result.id: ' + result.id.toString() + ', ' + typeof result.id.toString())
								console.log('prevTabId: ' + prevTabId + ', ' + typeof prevTabId)
								return result.id.toString() === openerTabId
							})
							console.log(newReferrer)
							prevURL = newReferrer.url
						} else {
							// 그 외의 모든 페이지에서 새 탭을 열였을 경우 referrer를 이전 URL로 사용

							prevURL = request.prevURL
						}
					} else {
						// 페이지 갱신 전후의 tabId가 같다면 현재 상태 그대로

						prevURL = request.prevURL
					}
				}
			}
		}
	
		localStorage.setItem('tabId', request.tabId)
		localStorage.setItem('tabInfo', JSON.stringify(currTabInfo))
		localStorage.setItem('prevURL', prevURL)
		localStorage.setItem('currURL', request.currURL)
	} else {
		localStorage.setItem('openerTabId', request.tabId)
	}
});
