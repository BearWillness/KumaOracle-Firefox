const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', () => {
  const settingsIcon = document.getElementById('settings-icon');
  const settingsPopup = document.getElementById('settings-popup');
  const closeSettings = document.getElementById('close-settings');
  const overlay = document.getElementById('overlay');
  const extractButton = document.getElementById('extract');
  const loadingSpinner = document.getElementById('loading-spinner');
  const outputDiv = document.getElementById('output');
  const placeholderText = document.getElementById('placeholder-text');
  const apiKeyInput = document.getElementById('api-key-input');
  const saveApiKeyButton = document.getElementById('save-api-key');
  const saveSuccessMessage = document.getElementById('save-success-message');

  // Function to capitalize the first letter
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Open settings popup
  settingsIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    overlay.style.display = 'block';
    settingsPopup.style.display = 'block';
    browserAPI.storage.local.get('openaiApiKey').then((result) => {
      apiKeyInput.value = result.openaiApiKey || '';
    }).catch(error => console.error('Error retrieving API key:', error));
  });

  // Close settings popup when clicking outside or on 'X'
  overlay.addEventListener('click', closeSettingsPopup);
  closeSettings.addEventListener('click', closeSettingsPopup);

  function closeSettingsPopup() {
    overlay.style.display = 'none';
    settingsPopup.style.display = 'none';
    saveSuccessMessage.style.display = 'none';
  }

  // Open Kuma Capital X link from settings popup
  document.getElementById('kuma-website').addEventListener('click', (event) => {
    event.preventDefault();
    window.open('https://x.com/Kuma_Capital', '_blank');
  });

  // Save API Key
  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      browserAPI.storage.local.set({ openaiApiKey: apiKey }).then(() => {
        saveSuccessMessage.textContent = 'API Key saved successfully!';
        saveSuccessMessage.style.display = 'block';
        setTimeout(() => {
          saveSuccessMessage.style.display = 'none';
          closeSettingsPopup();
        }, 1500);
      }).catch((error) => {
        console.error('Error saving API key:', error);
      });
    } else {
      alert('Please enter a valid API Key');
    }
  });

  // Extract and analyze content
  extractButton.addEventListener('click', () => {
    outputDiv.innerHTML = '';
    placeholderText.style.display = 'none';
    loadingSpinner.style.display = 'block';
    browserAPI.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      browserAPI.tabs.sendMessage(tabs[0].id, { action: 'extractContent' }).then((response) => {
        if (response && response.content) {
          extractAndAnalyzeContent(response.content);
        } else {
          loadingSpinner.style.display = 'none';
          alert('Error: No content to analyze.');
        }
      }).catch((error) => {
        console.error('Error sending message to content script:', error);
        loadingSpinner.style.display = 'none';
        alert('Error: Unable to extract content.');
      });
    });
  });

  // Function to extract and analyze content
  function extractAndAnalyzeContent(content) {
    browserAPI.storage.local.get('openaiApiKey').then((result) => {
      const apiKey = result.openaiApiKey;
      if (!apiKey) {
        loadingSpinner.style.display = 'none';
        alert('Error: API Key not set.');
        return;
      }
      const apiUrl = 'https://api.openai.com/v1/chat/completions';
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'user',
            content: `I want you to read the given article, and analyze it. Then provide a JSON object with as many affected assets (at least 5) as you can and the reasoning behind their short-term, medium-term, and long-term impacts (Bullish, Bearish, Neutral). The response format is:

            [
              {
                "asset": "assetname",
                "S": "",
                "S_reason": "",
                "M": "",
                "M_reason": "",
                "L": "",
                "L_reason": ""
              },
              {
                "asset": "asset2name",
                "S": "",
                "S_reason": "",
                "M": "",
                "M_reason": "",
                "L": "",
                "L_reason": ""
              }
            ]

            Only the JSON object as a response with no formatting at all.
            ${content}`
          }],
          temperature: 0.7
        })
      })
      .then(response => response.json())
      .then(data => {
        const rawContent = data.choices[0]?.message?.content;
        let parsedJson;
        try {
          parsedJson = JSON.parse(rawContent);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          loadingSpinner.style.display = 'none';
          alert('Error parsing response.');
          return;
        }
        loadingSpinner.style.display = 'none';
        displayResults(parsedJson);
      })
      .catch(error => {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        alert('Error during analysis.');
      });
    }).catch((error) => {
      console.error('Error retrieving API key:', error);
      loadingSpinner.style.display = 'none';
      alert('Error retrieving API key.');
    });
  }

  // Function to display results
  function displayResults(results) {
    outputDiv.innerHTML = '';

    // Add timeframe header
    const timeframeHeader = document.createElement('div');
    timeframeHeader.id = 'timeframe-header';
    timeframeHeader.innerHTML = `
      <div>Short Term</div>
      <div>Medium Term</div>
      <div>Long Term</div>
    `;
    outputDiv.appendChild(timeframeHeader);

    results.forEach(result => {
      const assetDiv = document.createElement('div');
      assetDiv.className = 'asset';
      assetDiv.innerHTML = `
        <div class="asset-name">${result.asset}</div>
        <div class="timeframe">
          <div class="${result.S.toLowerCase()}">${capitalizeFirstLetter(result.S)}</div>
          <div class="${result.M.toLowerCase()}">${capitalizeFirstLetter(result.M)}</div>
          <div class="${result.L.toLowerCase()}">${capitalizeFirstLetter(result.L)}</div>
        </div>
        <div class="reason">
          <p><strong>Short Term Impact:</strong><br>${result.S_reason}</p>
          <p><strong>Medium Term Impact:</strong><br>${result.M_reason}</p>
          <p><strong>Long Term Impact:</strong><br>${result.L_reason}</p>
        </div>
      `;
      assetDiv.addEventListener('click', () => {
        const reasonDiv = assetDiv.querySelector('.reason');
        if (reasonDiv.style.display === 'block') {
          reasonDiv.style.display = 'none';
          assetDiv.style.maxHeight = 'none';
        } else {
          reasonDiv.style.display = 'block';
          assetDiv.style.maxHeight = assetDiv.scrollHeight + 'px';
        }
      });
      outputDiv.appendChild(assetDiv);
    });
  }
});
