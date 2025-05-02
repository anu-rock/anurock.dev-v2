---
title: "Leetcode as a means to practice coding minimalism"
description: "Using minimum number of data structures and leveraging built-in defaults."
publishDate: "02 May 2025"
tags: ["leetcode", "interviews", "dsa", "minimalism"]
---

I am preparing for interviews.

Data structures and algorithms are often an essential part of tech interviews. Despite [my anguish for DSA interviews](https://anuragbhandari.com/life-thoughts/the-need-to-rethink-coding-interviews-1927/), it's an inescapable reality that I have to contend with.

[LeetCode.com](https://leetcode.com/) is seemingly the contemporary equivalent of Career Cup, Inteview Street, HackerRank, and the likes. It's what I am using for my practice with some help from Neetcode. After completing a dozen problems, I had a realization.

Putting aside the question of genuinity, **writing optimal code is an exercise in minimalism**.

1. Using the minimum number of data structures for temporary storage to get to the result.
2. Leveraging built-in structures and defaults to speed up coding (and delegate some complexity to the standard library).

Here's what I mean. ⬇️

Consider my first attempt of [Products of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/description/?envType=problem-list-v2&envId=oizxjoit):

```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        inputLength = len(nums)

        # Store products of all numbers to the left of each number in nums.
        prefixProducts = [None] * inputLength
        prefixProducts[0] = 1
        for i in range(1, inputLength):
            prefixProducts[i] = nums[i-1] * prefixProducts[i-1]

        # Store products of all numbers to the right of each number in nums.
        suffixProducts = [None] * inputLength
        suffixProducts[0] = 1
        for i in range(1, inputLength):
            suffixProducts[i] = nums[inputLength-i] * suffixProducts[i-1]

        # For each number in nums, multiply its prefix and suffix products.
        result = []
        for i in range(0, inputLength):
            result.append(prefixProducts[i] * suffixProducts[inputLength-1-i])
        return result
```

It's better than the brute force solution. It covered all of Neetcode's test cases. But did we really need two separate arrays for prefix and suffix products? Here's my refined solution inspired by Neetcode's editorial. See how much cleaner it is.

```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        inputLength = len(nums)
        result = [None] * inputLength

        # Pass 1: Caculate prefix product for each number in nums
        # and store it in result.
        prefixProduct = 1
        for i in range(0, inputLength):
            if i > 0:
                prefixProduct *= nums[i-1]
            result[i] = prefixProduct

        # Pass 2: Caculate suffix product for each number in nums
        # and store the multiplication of suffix and prefix products in result.
        suffixProduct = 1
        for i in range(inputLength-1, -1, -1):
            if i < inputLength-1:
                suffixProduct *= nums[i+1]
            result[i] *= suffixProduct # result[i] was a prefix product before this

        return result
```

Consider my solution for [Encode and Decode String](https://leetcode.com/problems/encode-and-decode-strings/description/?envType=problem-list-v2&envId=oizxjoit). Notice my use of [`str.zfill()`](https://www.w3schools.com/python/ref_string_zfill.asp). Alternatively, I would have to write custom code to add leading zeros, a surface area prone to errors.

```python
class Solution:
    SIZE_WIDTH = 3

    # For the input ["we","say",":","yes","!@#$%^&*()"],
    # returns "002we003say001:003yes010!@#$%^&*()",
    # where each string in the input array is prefixed with
    # its length (represented in 3-digit format to account for max length).
    #
    # NOTE: NeetCode's solution is a bit more elegant - prefixing each string
    # with its length AND a delimiter (eg. '4#'). That way, the solution is NOT
    # coupled with max string length constraint.
    def encode(self, strs: list[str]) -> str:
        encodedStr = ''
        for string in strs:
            encodedStr += str(len(string)).zfill(self.SIZE_WIDTH)
            encodedStr += string
        return encodedStr

    def decode(self, s: str) -> list[str]:
        decodedArr = []
        index = 0
        while index < len(s):
            stringStartIndex = index + self.SIZE_WIDTH
            stringSize = int(s[index:stringStartIndex])
            stringEndIndex = stringStartIndex + stringSize
            decodedArr.append(s[stringStartIndex:stringEndIndex])
            index = stringEndIndex
        return decodedArr
```

The more I practice leetcode, the more thankful I am for discovering more efficient ways to write code.