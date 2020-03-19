# Milestone 1

## Dataset

We are going to use [this](https://www.kaggle.com/sudalairajkumar/novel-corona-virus-2019-dataset/data) dataset for our project. This dataset contains information about the coronavirus and we'll especially make use of the timeseries containing data about the number of case/death/recovers.

- Quality of data?
  - The dataset is updated daily and was created by the Allen Institute for AI in partnership with the Chan Zuckerberg Initiative, Georgetown University’s Center for Security and Emerging Technology, Microsoft Research, and the National Library of Medicine - National Institutes of Health, in coordination with The White House Office of Science and Technology Policy. Hence it probably is of good quality. For more information, you can look at the [data repository](https://github.com/CSSEGISandData/COVID-19).

- How much pre-processing/cleaning?
  - Not much, as the data is pretty clean and collected in a way that makes processing it convenient.

## Problematic

- What am I trying to show with my visualization?
  - We want to show the world evolution of the virus over time and what principal measures have been taken at key points in time

- Think of an overview for the project, your motivation, and the target audience.
  - The goal is to have a quick and intelligible look at how the virus is spreading worldwide to get a sense of its evolution.
  - The visualization could be targeted for any user who wants to have a feel of how the epidemy progressed throughout time.

## Exploratory data analysis

Check this [notebook](./EDA.ipynb) to see our EDA.

## Related work

- What others have already done with the data?
  - Visualization of number of infected/death/recovered on a world map for the current day.
  - Charts & graphs of number of infected/death/recovered per country
  - Single country based graph of the evolution of the virus over time

- Why is your approach original?
  - In general we focus on the long term timeline of the virus, how it developped, how country reacted
  - It will show the growth rate and total infected/death/recovered values of the virus per country, showing which took more effective measures
  - Show the data on a world map with a time slider (option to go forward automatically at various speeds)
  - Display key events on the map when and where they happened (such as a big measure taken by country X at time Y)

- What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
  - Data visualization of the current state of the virus using world map and charts (many available everywhere, for instance [here](https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6))

- In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class.
  - We've never used this dataset before
