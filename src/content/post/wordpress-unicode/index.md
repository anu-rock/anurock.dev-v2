---
title: "Error saving emoji in WordPress"
description: "Fixing the 'Could not update post in database' error in WordPress"
publishDate: "26 Apr 2025"
tags: ["unicode", "wordpress", "mariadb", "character-set"]
---

I recently 'downgraded' my VPS. I didn't want to, but I was forced to.

My [webhost](https://contabo.com/en/) spiked their monthly fee by 25% for the second time in 2 years in the name of maintenance cost for legacy plans. So, what started at $6/mo became $10/mo. Quite a big jump for the same config, if you ask me.

When I asked to be downgraded to a similar but newer plan (half the cost), I was outright refused. *Technical reasons*, you know. Apparently, I would need to purchase new VPS on my own and pay them $80 as a one-time migration fee.

Eightly dollars for moving a bunch of folders between VPS servers on the same network! If that's not extortion, I don't know what is.

It took me a good couple of sittings, but eventually I was able to move over everything to their cheaper VPS. Yeah, I am richer by $48/yr now.

## Saving certain posts was erroring out

Long story short, my WP database character set and collation settings got lost in translation. Yesterday, while trying to update my home page I got this error:

:::warning[Error]
Could not update post in database.
:::

On recovering from the mini panic attack, I thought hard before searching. If there was an example of how to not display generic errors to users, this was it.

I searched and, as anticipated, found 127 different reasons behind the-best-generic-error-ever. The most common issues pointed to misconfigured database, blocked REST API, my internet connection, Gutenberg editor. The one that got my attention was:

> Unsupported characters copied from external sources will prevent you from saving or updating your posts on WordPress.

Somehow, that instantly clicked. I recalled the horrors of incorrect MySQL collation settings. So, it really was the first of the common issues: a misconfigred database. On digging a bit more, I found another internet bloke mention:

> I noticed after trial and error that REMOVING EMOJIS from the said post solved the issue.

My homepage did have emoji, quite a handful. I removed all of them. Saving started working!

## The investigation

I fired up [Termius](https://termius.com/) and SSH'd into my VPS. On querying INFORMATION_SCHEMA, it was clear my WP database wasn't using the full Unicode character set that supported emoji.

```sql
SELECT * FROM INFORMATION_SCHEMA.SCHEMATA;
```

```
+----------------------------+------------------------+
| SCHEMA_NAME                | DEFAULT_COLLATION_NAME |
+----------------------------+------------------------+
| information_schema         | utf8_general_ci        |
| my_wp_db                   | utf8mb3_general_ci     |
+----------------------------+------------------------+
```

I also checked at table and column level. It was a wild cocktail of `utf8mb3_general_ci` and `latin1_swedish_ci` collations.

## The fix

Changing collation *after* creating a database is... let's say running a half marathon is easier. Setting new collation for all tables and their columns would be a nightmare, so I cheated.

First, I set the default collation for my database so that any future table and column would inherit that:

```sql
ALTER DATABASE my_wp_db COLLATE = 'utf8mb4_unicode_ci';
```

Next, I installed [phpMyAdmin](https://www.phpmyadmin.net/). God knows why I didn't do it on day 1. Thankfully, it's easy on Ubuntu/Debian systems:

```bash
sudo apt install phpmyadmin
```

With a way to tweak my database without pulling my hair, I used PMA's visual query editor to set correct collation `utf8mb4_unicode_ci` for the following two columns. Yep, just two:

```
wp_posts.post_title
wp_posts.post_content
```

As you might guess, everything works now. Happy ending.