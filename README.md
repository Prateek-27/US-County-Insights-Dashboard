# Comprehensive County Ranking Dashboard: Health, Wealth, Education & Quality of Life

## Introduction

In the United States, socio-economic factors including access to healthcare, income, education, and quality of living are not evenly distributed. There are disparities, with some individuals enjoying top-quality healthcare, a high standard of living, and quality education, while others face challenges. This dashboard analyzes and visualizes socio-health data of US counties, assisting in identifying areas that need improvement.

![Dashboard Overview](/screenshots/Poster.jpg)

## Features

### Geo-Map Plot
* **Description:** The Geo-Map Plot displays a map of the United States with all its states and counties.
* **Interactions:**
  * Click on a state to zoom and view its counties.
  * Select a county to update other graphs.
  * Zoom in/out and drag for a better view.
  * Hover to display the name of county and state.

### Bar Plot
* **Description:** The Bar Plot visualizes scores assigned to counties, allowing comparison between them.
* **Interactions:**
  * View top 10 and bottom 10 counties based on their scores.
  * Switch between viewing top 10 and bottom 10 counties.
  * View scores for each category for a county selected on the map.

### MDS Plot (Feature MDS)
* **Description:** The MDS Plot shows correlations between features; correlated features are plotted closer.
* **Interactions:**
  * Interact with features to highlight points and draw lines tracking selected features.
  * Interaction updates the Bar Plot and, after sufficient points are selected, updates the PCP as well.

### PCP (Parallel Coordinates Plot)
* **Description:** PCP displays correlations between features, showing a line with feature values for each county.
* **Interactions:**
  * Brush the plot to visualize selected counties.
  * Rearrange feature axes to analyze correlation between different feature permutations.
  * Interaction updates Bar and Box plots.

### Box Plot
* **Description:** The Box Plot displays statistics for a feature and shows how a data point compares to the dataset.
* **Interactions:**
  * View boxplot for each subcategory score.
  * Switch between categories (Health, Wealth, Education, and Quality of Life).

## Conclusion
Through visualizations, we can identify patterns and associations between various factors, providing insights into disparities between counties. The insights derived from this dashboard are valuable for public health officials and policymakers, aiding in the development of targeted interventions to reduce disparities and improve outcomes in disadvantaged counties.
