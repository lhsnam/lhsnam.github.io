---
title: Seven decisions that make a chart readable
date: 2026-11-16
tags: visualisation, figures
minutes: 6
summary: What I took from teaching myself data visualisation, boiled down to seven decisions, each shown as a before and after chart.
---

Most of my figures are read by people who did not run the analysis: clinicians, collaborators, reviewers. They give a chart a few seconds. Over the past years I have been reading the best of what practitioners write about this, and I kept noticing that the advice repeats. This note is my own condensed version: seven decisions, each with a small before and after. The data in the figures are made up for illustration.

## 1. Decide what the chart should say

Before choosing a chart type, I write one sentence: what should the reader take away? That sentence usually becomes the headline. A title that names the topic leaves the work to the reader. A title that states the finding tells them where to look, and turns the chart into evidence for a claim.

{{fig:f1}}

The time you spend making a chart easier to understand is time you save every reader who opens it.

## 2. Start in grey, add colour for the point

Colour is the strongest attention signal on a page, so spend it carefully. I build the first version of a figure in grey only, then ask which one element the reader must not miss and give that element the accent colour. Everything else, including axes and gridlines, stays quiet. Two related rules: keep the same colour for the same variable across figures, and if a chart needs more than about seven colours, change the chart type or group categories.

{{fig:f2}}

## 3. Label directly, not through a legend

Every trip from the data to a legend and back costs attention. Where possible I put the name at the end of the line or on the bar, so explanation and data sit next to each other. A legend is a fallback for when direct labels cannot fit.

{{fig:f3}}

## 4. Annotate the "why", with two levels of text

Data tell readers what happened. Only the author can say why. A short note at the right spot, such as a treatment start or a batch change, is often the most useful thing in a figure. I keep annotation to two clearly different levels, for example a bold short line and a grey detail line, left-aligned and placed close to what they describe.

{{fig:f4}}

## 5. Let lightness carry order

For a continuous scale, the eye reads order from lightness before it reads hue. A single hue that runs from light to dark carries low-to-high naturally. A rainbow scale mixes dark and bright steps in no order, so readers have to keep consulting the key. A quick test: convert the figure to greyscale. If the order disappears, the scale is the problem.

{{fig:f5}}

## 6. Design for colourblind readers from the start

A noticeable share of readers cannot separate some colour pairs, and red against green is the classic failure. The fix is cheap: choose colours that differ in lightness as well as hue (blue and orange is a dependable pair), put the key values in the colours that are easiest to distinguish, and add a second cue such as direct labels, shapes or dashed lines. The greyscale check from the previous step doubles as a rough colourblind check, and a proper simulator is worth a minute before publishing.

{{fig:f6}}

## 7. Pick a font that behaves with numbers

Most charts do well with a plain sans-serif. For tables and labels with numbers, I look for tabular figures, where every digit has the same width, so decimals and thousands line up. I avoid very thin or very narrow weights, keep text large enough to read on a phone, and use bold only for the title or a few emphasised words.

{{fig:f7}}

## My short checklist

1. Can I state the message in one sentence, and is it the headline?
2. Is everything grey except the one thing that matters?
3. Are labels on the data, not in a legend?
4. Is the "why" annotated, in two text levels at most?
5. Does the figure survive greyscale?
6. Are the numbers set in a font with tabular figures?

## Where this comes from

These ideas are my synthesis of material I have read repeatedly. The guides I return to most are the Datawrapper articles on [choosing colours](https://www.datawrapper.de/blog/colors), [colourblind readers](https://www.datawrapper.de/blog/colorblindness-part2), [text in charts](https://www.datawrapper.de/blog/text-in-data-visualizations), [fonts](https://www.datawrapper.de/blog/fonts-for-data-visualization), [questions to ask when creating charts](https://www.datawrapper.de/blog/better-charts) and [respecting readers' time](https://www.datawrapper.de/blog/readers-time), plus Andy Kirk's [Make grey your best friend](https://visualisingdata.com/2015/01/make-grey-best-friend/). For a book, I recommend *Storytelling with Data* by Cole Nussbaumer Knaflic ([author's site](https://www.storytellingwithdata.com/)). For ideas, I browse [Data Vis Dispatch](https://www.datawrapper.de/blog/category/data-vis-dispatch), [Our World in Data](https://ourworldindata.org/) and [FlowingData](http://flowingdata.com). For map files, [Natural Earth](https://www.naturalearthdata.com/) is free.
