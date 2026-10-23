---
title: "Critical PHP updates"
description: "PHP2Shell vulnerabilities that are too bad to ignore. Update now!"
publishDate: "2026-10-23T19:02:31+05:30"
tags: ["php", "security", "vulnerabilities", "hacking"]
---


You have surely heard of it by now. The news went viral at internet scale soon after the patches were announced. ICYMI, here's a [great summary](https://blog.qualys.com/vulnerabilities-threat-research/2026/10/20/php-announces-critical-security-release-for-two-vulnerabilities) by the cybersecurity company Qualys.

I patched my VPS the same day the patches came out. It took me a good 40 mins but it was well worth the effort. A significant portion of those forty minutes went into being confused by why the latest PHP version in my Ubuntu 24.04 was 8.3.6 and not 8.3.36 that contained the patch.

Until I learned that Ubuntu typically freezes package versions in LTS releases to maintain stability but they do backport all security patches from newer minor versions into their latest frozen versions. I verified this by checking the installed package's changelog which contained a mention of the notorious CVE-2026-109618 and CVE-2026-109619 vulnerabilities.

Security patches come out literally everyday, each with a threat label ranging from low to critical. DevOps and IT teams around the world apply the critical ones typically the same day they are released. But when something like PHP, the backbone of the internet (ahem, WordPress), is broken it needs to be mitigated right away.

I don't run many PHP sites. In fact, my WordPress blog at [anuragbhandari.com](https://anuragbhandari.com) is the only PHP site I have running today. The one where you are reading this post is a statically generated Astro site. And pure HTML is immune to vulnerabilities, lol. Right?