import csv
import requests
from bs4 import BeautifulSoup
import re


def scrape_population():
    """
    Scrape population of each country from Wikipedia and write to csv file
    """
    rows = [['name', 'population'], ['Kosovo', '1920079'], ['Sao Tome and Principe', '211028']]
    URL = 'https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)'
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, 'html.parser')

    countries = soup.find('table', id='main').find('tbody').find_all('tr')[1:-1]

    for country in countries:
        fields = country.find_all('td')
        name = fields[0].find('a')['title']
        population = fields[-2].text.replace(',', '')

        # Rename countries
        name = name.replace('The Bahamas', 'Bahamas')
        name = name.replace('The Gambia', 'Gambia')
        name = name.replace('Georgia (country)', 'Georgia')
        name = name.replace('Republic of Ireland', 'Ireland')
        name = re.sub('^Republic of the Congo', 'Congo', name)
        name = name.replace('East Timor', 'Timor-Leste')

        if name == 'Serbia':
            # Remove Kosovo population
            population = '7078110'

        rows.append([name, population])
    
    with open('generated/population.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(rows)


if __name__ == '__main__':
    scrape_population()