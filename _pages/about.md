---
permalink: /
title: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

{% if site.google_scholar_stats_use_cdn %}
{% assign gsDataBaseUrl = "https://cdn.jsdelivr.net/gh/" | append: site.repository | append: "@" %}
{% else %}
{% assign gsDataBaseUrl = "https://raw.githubusercontent.com/" | append: site.repository | append: "/" %}
{% endif %}
{% assign url = gsDataBaseUrl | append: "google-scholar-stats/gs_data_shieldsio.json" %}

<span class='anchor' id='about-me'></span>

# 👨‍🎓 About me

I am currently a 2nd-Year Master student at [Tsinghua University](https://www.tsinghua.edu.cn/en/) <img src='./images/thu.png' style='width: 2em;'>, under the guidance of [Prof. Haoqian Wang](https://www.sigs.tsinghua.edu.cn/whq/). I got B.Eng. degree in Robot Engineering at [South China University of Technology](https://www.scut.edu.cn/) <img src='./images/scut.jpg' style='width: 2em;'>. 

My current research interests lie in 3D computer vision and video generation, focusing on human-centric tasks like animatable digital avatar creation and 3D scene reconstruction. 
 
More about me through [CV-cn](_pages/files/Eastbean_CV.pdf).

<br>


# 💻 Experience

- 2024.08 ~ 2025.03, I was a research intern at the [IDEA](https://www.idea.edu.cn/), advised by Yu Li[https://yu-li.github.io/] and Yunfei Liu[https://liuyunfei.net/].

<br>

# 📝 Publications 
<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ECCV 2024</div><img src='images/GS-W.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

<a href="https://arxiv.org/abs/2407.06984" style="font-size: 22px; color: #483D8B; text-decoration: none">**Gaussian in the Wild: 3D Gaussian Splatting for Unconstrained Image Collections**</a><br>
<span style="font-size: 18px;">**Dongbin Zhang\*** , Chuming Wang\*, Weitao Wang, Peihao Li, Minghan Qin, Haoqian Wang†</span><br>
<span style="font-size: 18px;">[**Page**](https://eastbeanzhang.github.io/GS-W/)   [**Paper**](https://arxiv.org/pdf/2403.15704)   [**Code**](https://github.com/EastbeanZhang/Gaussian-Wild)</span>

<span style="font-size: 18px;">-  GS-W utilizes 3D Gaussian Splatting with introduced separated intrinsic and dynamic appearance to reconstruct scenes from uncontrolled images, achieving high-quality results.</span>

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">CVPR 2025</div><img src='images/HRAvatar.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

<a href="https://arxiv.org/abs/2408.13770" style="font-size: 22px; color: #483D8B; text-decoration: none">**HRAvatar: High-Quality and Relightable Gaussian Head Avatar**</a><br>
<span style="font-size: 18px;">**Dongbin Zhang**, Yunfei Liu, Lijian Lin, Ye Zhu, Kangjie Chen, Minghan Qin, Yu Li†, Haoqian Wang†</span><br>
<span style="font-size: 18px;">[**Page**](https://eastbeanzhang.github.io/HRAvatar/) [**Paper**](https://arxiv.org/pdf/2503.08224)   [**Code**](https://github.com/Pixel-Talk/HRAvatar)</span>

<span style="font-size: 18px;">- With monocular video input, HRAvatar reconstructs a high-quality, animatable 3D head avatar that enables realistic relighting effects and simple material editing.</span>

</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">ICCV 2025</div><img src='images/GUAVA.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

<a href="https://arxiv.org/abs/2304.01054" style="font-size: 22px; color: #483D8B; text-decoration: none">**GUAVA: Generalizable Upper Body 3D Gaussian Avatar**</a><br>
<span style="font-size: 18px;"> **Dongbin Zhang**, Yunfei Liu†, Lijian Lin, Ye Zhu, Yang Li, Minghan Qin, Yu Li‡, Haoqian Wang†</span><br>
<span style="font-size: 18px;">[**Page**](https://eastbeanzhang.github.io/GUAVA/) [**Paper**](https://arxiv.org/pdf/2505.03351v1)</span>

<span style="font-size: 18px;">-  We propose GUAVA, the first framework for fast animatable upper-body 3D Gaussian avatar reconstruction from a single image.</span>

</div>
</div>

# 🏆 Honors and Awards

- National First Prize (top 0.7%), [CUMCM: China Undergraduate Mathematical Contest in Modeling](https://www.mcm.edu.cn/html_cn/node/5d988b4e510d9dc78168e258dc76a48f.html), 2021.
- ​​Meritorious Winner​ (top 7%), [MCM: The Mathematical Contest in Modeling](https://www.comap.com/contests/mcm-icm), 2022.
- Scholarship, Tsinghua University, 2024.
- Scholarship, South China University of Technology, 2019-2023.
