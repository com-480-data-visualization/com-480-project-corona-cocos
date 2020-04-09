import csv
import requests
from bs4 import BeautifulSoup


def scrape_population():
    rows = [['name', 'population'], ['Kosovo', '1920079'], ['Sao Tome and Principe', '211028']]
    URL = 'https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)'
    page = requests.get(URL)
    soup = BeautifulSoup(page.content, 'html.parser')

    countries = soup.find('table', id='main').find('tbody').find_all('tr')[1:-1]

    for country in countries:
        fields = country.find_all('td')
        name = fields[0].find('a')['title']
        population = fields[-2].text.replace(',', '')



        rows.append([name, population])
    
    with open('generated/population.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(rows)


if __name__ == '__main__':
    scrape_population()