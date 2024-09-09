browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractContent") {
    let mainBody = document.querySelector('article') ||
                   document.querySelector('div.main-content') ||
                   document.querySelector('div.content');
    if (mainBody) {
      sendResponse({ content: mainBody.textContent });
    } else {
      sendResponse({ content: "Main body not found" });
    }
  }
});
