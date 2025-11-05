---
title: "Under Pressure: Benchmarking Node.js on a Single-Core EC2"
url: "https://dev.to/ocodista/under-pressure-benchmarking-nodejs-on-a-single-core-ec2-5ghe"
excerpt: "Hi!  In this post, I'm going to stress test a Node.js 21.2.0 pure API (no framework!) to see the..."
readDate: "2025-11-05T09:03:12.855Z"
---

~2500 reqs/sec. That's what a lowly 1-core 1-GiB server (Node.js & Postgres) can handle on its own. Let that sink in. Horizontally scaling is not always the answer and comes with its own complexity/tradeoffs. See if increasing the machine size will be enough before throwing in more servers and load balancers.
