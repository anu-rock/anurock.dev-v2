---
title: "Storage engines in MySQL"
description: "Support for multiple storage engines makes MySQL more versatile than you think it is."
publishDate: "2025-10-31"
tags: ["mysql", "storage", "database"]
---

I was recently asked about the different storage engines in MySQL in a technical interview. I was clueless. I could faintly recall names like "MySAM" and "Inno" but I had no idea what they were or how they differed or even if they were the correct spellings.

So, I looked up right after my interview. The correct names are MyISAM and InnoDB. If memory serves me well, MyISAM was the default storage engine during the early days of my career. Gemini tells me it was the default until MySQL 5.5, which was released in 2010. InnoDB has been the default since then.

To my horror, I found out that MyISAM doesn't support foreign keys or transactions. How did I not know this? I have worked with MySQL for over a decade! Turns out, I never really had to care about storage engines because InnoDB has been the default for so long.

Anyway, here's a quick run down of the popular engines in MySQL. Not superly going into details since it's all in the [official docs](https://dev.mysql.com/doc/refman/8.4/en/storage-engines.html).

- **InnoDB:** The default storage engine. Supports ACID-compliant transactions, foreign keys, and row-level locking. Good for high-concurrency applications.
- **MyISAM:** An older storage engine. Does not support transactions or foreign keys. Uses table-level locking. Good for read-heavy applications where data integrity is not a concern.
- **MEMORY:** Stores all data in RAM for fast access. Data is lost when the server is restarted. Good for temporary data or caching.
- **CSV:** Stores data in comma-separated values format. Good for data exchange with other applications.

And a couple of obscure ones:

- **ARCHIVE:** Optimized for storing large amounts of infrequently accessed data. Compresses data to save space. Good for logging and archival purposes.
- **NDB (Clustered):** Designed for distributed databases. Supports high availability and scalability. Good for applications requiring real-time data access across multiple nodes.

Now you know one more thing about MySQL! Congrats.

---

Until next time,  
Cheers ✌️