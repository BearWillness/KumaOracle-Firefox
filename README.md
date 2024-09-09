# Kuma Oracle Extension (Firefox)

### Version: 1.0

## Overview

Kuma Oracle is an official Kuma Capital extension that evaluates the impact of real-world events on risk assets. It extracts content from the active tab, analyzes the data using the OpenAI API, and provides detailed feedback on how different assets will be affected in the short, medium, and long term. This extension is a valuable tool for traders, analysts, and those who want to stay ahead in understanding the market's reaction to significant events.

## Features

- **Content Extraction**: Automatically extracts content from web pages, focusing on articles and main content sections.
- **OpenAI Integration**: Utilizes OpenAI's GPT model to analyze events and assess their impact on various assets.
- **Asset Impact Analysis**: Provides short-term (STA), medium-term (MTA), and long-term (LTA) evaluations of asset performance.
- **API Key Management**: Allows users to input and store their own OpenAI API key securely.
- **Interactive Interface**: Displays asset impact in a structured, user-friendly interface, with expandable sections to view detailed reasoning.

## Installation

1. **Download the Kuma Oracle Files**: Clone or download the repository files to a folder on your local machine.

2. **Load Unpacked Extension**:
   - Open Firefox and go to `about:debugging` in the URL bar.
   - Click on "This Firefox" in the sidebar.
   - Select "Load Temporary Add-on…" and choose any file from the directory where the extension files are saved (e.g., `manifest.json`).
   
3. **Pin the Extension**: The extension will now be active and can be accessed from the toolbar.

## Usage

1. **Extract Content**: Navigate to a webpage with financial or market-related content. Click the Kuma Oracle extension icon in your Firefox toolbar.

2. **Analyze Data**:
   - Click "Extract & Analyze Content" in the popup to extract data from the active tab and initiate the analysis process.
   - The extension will use the OpenAI API to analyze the extracted content and return an evaluation of affected assets.

3. **View Results**:
   - Results are displayed in a structured format, showing asset names and their short-term, medium-term, and long-term impacts.
   - Click each asset to reveal the reasoning behind each time-frame evaluation.

4. **API Key Setup**:
   - On first use, or when the API key needs updating, open the settings menu within the popup.
   - Enter your OpenAI API key and save it for future analyses.

## Extension Components

### manifest.json
Defines the permissions, content scripts, background scripts, and overall structure of the extension.

### background.js
Handles the background processes, such as listening for clicks on the extension icon and interacting with the content script.

### kuma.js
Responsible for content extraction on web pages, targeting article or main content sections. It communicates with the background script and popup.

### popup.html
Defines the user interface of the extension, with buttons and output areas for interaction. The design is modern and optimized for clarity.

### popup.js
Manages the interaction logic within the popup, including extracting content, communicating with the OpenAI API, and displaying results.

## API Integration

- The extension requires an OpenAI API key to function. This key can be entered through the settings menu in the popup.
- Once the content is extracted from a webpage, it is sent to OpenAI’s API to analyze the article's potential impact on different assets and their performance across time frames.

## Permissions

- **activeTab**: Allows the extension to access the active browser tab to extract content.
- **storage**: Used to securely store the user's OpenAI API key for future analyses.

## Development

To contribute or modify the extension, follow these steps:

1. Clone this repository to your local machine.
2. Make the necessary changes to the code.
3. Load the updated extension temporarily using `about:debugging` in Firefox.
4. Test the extension by clicking the icon and running the "Extract & Analyze" process.

## Troubleshooting

- If the message "Error: No content to analyze" appears, ensure that the page contains content such as articles or significant sections of text.
- Verify that your OpenAI API key is valid and properly entered in the settings menu.
- If there are errors with the analysis, check the console logs for any issues with the JSON response from OpenAI.

## License

This extension is licensed under the MIT License. Please refer to the `LICENSE` file for further details.

## Contact

For further information or inquiries, visit [Kuma Capital](https://x.com/Kuma_Capital) or contact us via the official website.
