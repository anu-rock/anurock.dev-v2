---
title: "How Perplexity Built an AI Google"
url: "https://blog.bytebytego.com/p/how-perplexity-built-an-ai-google?utm_campaign=post&utm_medium=web"
excerpt: "In a decisive move, Perplexity abandoned four months of work on their original project to focus entirely on the challenge of building a true answer engine for the web."
readDate: "2025-11-10T03:40:03.974Z"
---

First, I'm blown by how RAG - often perceived as inaccurate and clunky - can be the backbone of something as sophisticated as Perplexity. Second, it's amazing to know what it takes to build a hyper-accurate RAG pipeline. KNOWLEDGE BASE: A massive dataset built from crawling 200 billion web pages. RETRIEVAL ENGINE: Vespa, a low-latency search engine, designed to operate at web-scale, that combines vector and lexical search with ML-powered ranking. LLM: An intelligent router to run user's query + retrieved context on the best-suited model among in-house and leading ones (GPT/Claude), balancing cost and quality.
