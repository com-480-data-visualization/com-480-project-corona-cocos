# Milestone 1

## Dataset

We are going to use [this](https://github.com/CSSEGISandData/COVID-19) dataset for our project. This dataset contains information about the coronavirus and we'll especially make use of the time-series containing data about the number of cases, deaths and recoveries along with their location.

- Quality of data?
  - The dataset is updated daily. It is made available by the Johns Hopkins University Center for Systems Science and Engineering (JHU CSSE). Its sources are multiple, from all around the world: World Health Organization, Hong Kong Department of Health, Government of Canada etc. The full list is given in the README of the github. Hence it probably is of good quality.

- How much pre-processing/cleaning?
  - Hardly any, the data is clean and collected in a way that makes processing it convenient.

## Problematic

- What am I trying to show with my visualization?
  - We want to show the world evolution of the virus over time and what principal measures have been taken at key points in time. This will permit to easily visualize the effects of the measures in each part of the world.

- Think of an overview for the project, your motivation, and the target audience.
  - The goal is to have a quick and intelligible look at how the virus is spreading worldwide to get a sense of its evolution.
  - The visualization could be targeted for any user who wants to have a feel of how the epidemy progressed throughout time.

## Exploratory data analysis

Check the [EDA](./EDA.ipynb) notebook to see our EDA. As we show in this notebook, the data is very clean, complete and perfectly adapted to create a plot over time of the Corona virus impact. We sanitized the types, missing values, checked if the data values (number of cases) is credible and it indeed is. We also verified that the `latitude` and `longitude` attributes correspond to the country information and only one inconsistency was present.

## Related work

- What others have already done with the data?
  - Visualization of number of infected/death/recovered on a world map for the current day.
  - Charts & graphs of number of infected/death/recovered per country
  - Graph of the evolution of the virus over time for a country or for the whole world

- Why is your approach original?
  - In general we focus on the long term timeline of the virus, how it developped, how country reacted
  - It will show the growth rate and total infected/death/recovered values of the virus per country, showing which took more effective measures
  - Show the data on a world map with a time slider (option to go forward automatically at various speeds)
  - Display key events on the map when and where they happened (such as a big measure taken by country X at time Y)

- What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
  - Data visualization of the current state of the virus using world map and charts (many available everywhere, for instance [here](https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6) is an example done with the dataset we'll use)

- In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.
  - We've never used this dataset before
