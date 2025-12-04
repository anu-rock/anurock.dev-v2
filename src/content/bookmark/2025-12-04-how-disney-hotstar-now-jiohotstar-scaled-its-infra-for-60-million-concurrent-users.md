---
title: "How Disney Hotstar (now JioHotstar) Scaled Its Infra for 60 Million Concurrent Users"
url: "https://blog.bytebytego.com/p/how-disney-hotstar-now-jiohotstar?utm_campaign=post&utm_medium=web"
excerpt: "In this article, we look at how the Disney+ Hotstar engineering team achieved that scale and the challenges they faced."
readDate: "2025-12-04T04:38:41.562Z"
---

A lot of the details in this infra-heavy article went over my head, but one thing stood out — separating APIs into cacheable and non-cacheable and creating different API gateways for both. The 'cacheable' gateway could then be shaved off a bit in terms of unnecessary security and routing checks. That alone made things a lot faster without additional infra.
