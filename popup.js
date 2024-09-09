const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

document.getElementById('logo').addEventListener('click', (event) => {
  event.stopPropagation(); 
  const dropdown = document.getElementById('dropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', (event) => {
  const dropdown = document.getElementById('dropdown');
  if (event.target.id !== 'logo' && dropdown.style.display === 'block') {
    dropdown.style.display = 'none';
  }
});

document.getElementById('kuma-website').addEventListener('click', () => {
  window.open('https://x.com/Kuma_Capital', '_blank'); 
});

document.getElementById('settings').addEventListener('click', (event) => {
  event.stopPropagation();
  const settingsPopup = document.getElementById('settings-popup');
  settingsPopup.style.display = 'block';
  document.getElementById('dropdown').style.display = 'none'; 

  browserAPI.storage.local.get('openaiApiKey').then((result) => {
    const apiKey = result.openaiApiKey || '';
    document.getElementById('api-key-input').value = apiKey;
  }).catch(error => console.error('Error retrieving API key:', error));
});

document.addEventListener('click', (event) => {
  const settingsPopup = document.getElementById('settings-popup');
  if (!settingsPopup.contains(event.target) && settingsPopup.style.display === 'block') {
    settingsPopup.style.display = 'none';
  }
}, true);

document.getElementById('save-api-key').addEventListener('click', () => {
  const apiKey = document.getElementById('api-key-input').value;
  const successMessage = document.getElementById('save-success-message');

  if (apiKey) {
    browserAPI.storage.local.set({ openaiApiKey: apiKey }).then(() => {
      successMessage.textContent = 'API Key saved successfully!';
      successMessage.style.display = 'block'; 
    }).catch((error) => {
      console.error('Error saving API key:', error);
    });
  } else {
    alert('Please enter a valid API Key');
  }
});

document.getElementById('extract').addEventListener('click', () => {
  document.getElementById('loading-spinner').style.display = 'block';

  browserAPI.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    browserAPI.tabs.sendMessage(tabs[0].id, { action: 'extractContent' }).then((response) => {
      if (response && response.content) {
        extractAndAnalyzeContent(response.content);
      } else {
        document.getElementById('status').textContent = 'Error: No content to analyze.';
        document.getElementById('loading-spinner').style.display = 'none'; 
      }
    }).catch((error) => {
      console.error('Error sending message to content script:', error);
      document.getElementById('loading-spinner').style.display = 'none';
    });
  });
});

function extractAndAnalyzeContent(content) {
  browserAPI.storage.local.get('openaiApiKey').then((result) => {
    const apiKey = result.openaiApiKey;

    if (!apiKey) {
      document.getElementById('status').textContent = 'Error: You need to supply an API key.';
      document.getElementById('loading-spinner').style.display = 'none'; 
      return;
    }

    document.getElementById('status').textContent = 'Status: Analyzing...';
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `I want you to read the given article, and analyze it. Then provide a JSON object with as many affected assets (at least 5) as you can and the reasoning behind their short-term, medium-term, and long-term impacts (bullish, bearish, neutral). The response format is:

        [
          {
            "asset": "assetname",
            "STA": "",
            "STA_reason": "",
            "MTA": "",
            "MTA_reason": "",
            "LTA": "",
            "LTA_reason": ""
          },
          {
            "asset": "asset2name",
            "STA": "",
            "STA_reason": "",
            "MTA": "",
            "MTA_reason": "",
            "LTA": "",
            "LTA_reason": ""
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
        document.getElementById('status').textContent = 'Status: Error parsing JSON';
        document.getElementById('loading-spinner').style.display = 'none'; 
        return;
      }

      document.getElementById('loading-spinner').style.display = 'none'; 
      document.getElementById('status').textContent = 'Status: Analysis Complete';
      displayResults(parsedJson);
    })
    .catch(error => {
      document.getElementById('status').textContent = 'Status: Error during analysis.';
      document.getElementById('loading-spinner').style.display = 'none';
      console.error('Error:', error);
    });
  }).catch((error) => {
    document.getElementById('status').textContent = 'Error retrieving API key.';
    document.getElementById('loading-spinner').style.display = 'none'; 
    console.error('Error retrieving API key:', error);
  });
}

function displayResults(results) {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = ''; 

  results.forEach(result => {
    const assetDiv = document.createElement('div');
    assetDiv.className = 'asset';
    assetDiv.innerHTML = `
      <div class="asset-name">${result.asset}</div>
      <div class="timeframe">
        <div class="sta ${result.STA.toLowerCase()}">STA: ${result.STA}</div>
        <div class="mta ${result.MTA.toLowerCase()}">MTA: ${result.MTA}</div>
        <div class="lta ${result.LTA.toLowerCase()}">LTA: ${result.LTA}</div>
      </div>
      <div class="reason">
        <p><strong>Short Term Affect:</strong> ${result.STA_reason}</p>
        <p><strong>Medium Term Affect:</strong> ${result.MTA_reason}</p>
        <p><strong>Long Term Affect:</strong> ${result.LTA_reason}</p>
      </div>
    `;

    assetDiv.addEventListener('click', () => {
      const reasonDiv = assetDiv.querySelector('.reason');
      reasonDiv.classList.toggle('show'); 
    });

    outputDiv.appendChild(assetDiv);
  });
}
