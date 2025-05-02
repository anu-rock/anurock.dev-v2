---
title: "Preventing KeyError in Python dictionaries"
description: "Python comes with something called defaultdict that will help you avoid KeyErrors."
publishDate: "02 May 2025"
tags: ["python", "dictionary", "hashmap"]
---

In my post on [coding minimalism](/posts/leetcode-minimalism), I talked about leveraging data structures and defaults built into a language's standard library to avoid error-prone boilerplate code.

This post is a quick reminder that Python comes with something called [`defaultdict`](https://www.geeksforgeeks.org/defaultdict-in-python/) that will help you avoid errors resulting from trying to access non-existent keys in a dictionary.

```python
my_dict = dict({
    "one": 1,
    "three": 3
})

print(my_dict["two"]) # KeyError: 'two'
# To avoid KeyError, use either:
print(my_dict.get("two")) # None
# or:
print(my_dict.get("two", 0)) # 0
```

A more elegant solution:

```python
from collections import defaultdict

my_dict = defaultdict(int) # default value type supplied as argument
my_dict["one"] = 1
my_dict["three"] = 3
print(my_dict["two"]) # 0
```