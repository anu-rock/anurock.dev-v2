---
title: "What caused the large AWS outage?"
url: "https://newsletter.pragmaticengineer.com/p/what-caused-the-large-aws-outage?utm_campaign=post&utm_medium=web"
excerpt: "On Monday, a major AWS outage hit thousands of sites & apps, and even a Premier League soccer game. An overview of what caused this high-profile, global outage"
readDate: "2025-11-05T06:48:03.322Z"
---

A stark reminder about over-dependence on one vendor for all infra needs. Amazon uses DNS tricks to load-balance its DynamoDB services. Due to a race condition, DNS records were emptied causing an outage of this massively popular distributed NoSQL database. That didn't just impact applications using DynamoDB but also EC2 which depends on it for droplet provisioning configuration. Double whammy!
