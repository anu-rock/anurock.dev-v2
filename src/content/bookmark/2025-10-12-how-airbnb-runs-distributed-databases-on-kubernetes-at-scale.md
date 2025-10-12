---
title: "How Airbnb Runs Distributed Databases on Kubernetes at Scale"
url: "https://blog.bytebytego.com/p/how-airbnb-runs-distributed-databases?utm_campaign=post&utm_medium=web"
excerpt: "In this article, we will look at how Airbnb implemented this design and the challenges they faced."
readDate: "2025-10-12T04:18:52.918Z"
---

Distributed SQL databases are not magic boxes that will handle availability and reliability challenges without thoughtful engineering. Airbnb’s case study is a great example of such engineering: don’t let more than one node replacement run at a time (serialized replacement controlled by custom k8s controller logic), spread a database across data centers (AWS availability zones), and don’t store data on the same node as DB server (detachable AWS EBS volumes).
