---
layout: post
author: Shavon Nand
title: glb file format
image: assets/images/glb_file_format/Screenshot 2025-01-04 065807.png
alt: "Screenshot of Google's AI Summary from a Google search of 'glb file format'"
caption: "Screenshot of Google's AI Summary from a Google search of 'glb file format'"
---

**I wanted to** look at the quality of Google's first page of search results, using search operators to exclude AI written articles and remove Google's AI Summary. Basically using `before:` and `-ai` search operators to go by each year and to remove ai summary at the top.

The idea came from this video:

<iframe src="https://www.youtube.com/embed/-opBifFfsMY" title="Generative AI is a Parasitic Cancer" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Going through and using the search operators we can see that the link for <https://www.khronos.org/Gltf>, which are the people behind glTF aren't on the first page of Google results. It only appears after I use the `-ai` search operator.

![Screenshots of Google's search results for 'glb file format' with different search operators, highlighting the links to 'glTF Overview - The Khronos Group Inc'](</assets/images/glb_file_format/glTF Overview - The Khronos Group Inc.png>)

If we highlight any links from khronos.org we get links to <https://www.khronos.org/files/gltf20-reference-guide.pdf> for our `before:2018 -ai` search, and links to <https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html> for our `before:2022 -ai` and `before:2023 -ai` searches.

![Screenshots of Google's search results for 'glb file format' with different search operators, highlighting any links to khronos.org](</assets/images/glb_file_format/The Khronos Group Inc additional.png>)

The featured snippet also doesn't use the direct source <https://www.khronos.org/Gltf>, unless we search `before:2018 -ai` and earlier years.

![Screenshots of Google's search results for 'glb file format' with different search operators, highlighting the featured snippets; khronos.org in blue, other sites in red](</assets/images/glb_file_format/featured snippet.png>)

ChatGPT written articles have pushed out the actual useful results, and now Google is using those poorly written AI articles as sources for it's AI Overview.

![Screenshot of Google's AI Summary from a Google search of 'glb file format'](</assets/images/glb_file_format/Screenshot 2025-01-04 065807.png>)

Anyways, heres some information about the "glb file format".

* `.glb` is the filename extension for Binary glTF ([1]).
* glTF stands for Graphics Language Transmission Format or GL Transmission Format ([2]).
* Binary glTF is a binary option for storing the content for a glTF asset ([2]).
* A glTF asset is represented by a JSON-formatted file `.gltf`, binary files `.bin` and image files `.jpg`, `.png` ([3]).
* glTF files are stored in GLB container `.glb` ([4]).
* Link to the  IANA registration: <https://www.iana.org/assignments/media-types/model/gltf-binary>
* Link to the Specification by the Khronos Group: <https://www.khronos.org/gltf>
* Link to the GLB File Format Specification: <https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#glb-file-format-specification>



[1]: <https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#glb-file-format-specification>
[2]: <https://www.loc.gov/preservation/digital/formats/fdd/fdd000498.shtml>
[3]: <https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#gltf-basics>
[4]: <https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#file-extensions-and-media-types>
