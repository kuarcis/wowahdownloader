# WoW AH Downloader
# Overview
wowahdownloader is a specialized tool for downloading and processing JSON data from the World of Warcraft (WoW) Auction House (AH). It is crafted in Google App Script, closely resembling JavaScript in syntax.

# Features
Data Downloading: Leverages ahdump.js to check for and store new AH price JSON data.
Data Processing: Computes the weighted average price of the top five orders for each item and records the results in a dbtmp sheet.
Database Updates: New item details are uploaded to MongoDB, and price data is sent to InfluxDB.
# Performance
The script is fine-tuned for quick execution, completing data processing tasks within 10-20 seconds under the free Google Script account's 6-minute daily computation limit. For routine operations, a 30-minute interval is scheduled.

# Project Status
This project, last updated in September 2019, is not slated for future updates to align with Blizzard's current token system or for migration to other platforms. Nonetheless, questions and discussions on data processing or any other related topics are encouraged.

# Contact
Should you have any inquiries or require assistance, please feel free to make contact.

Joseph, September 2019
