from bs4 import BeautifulSoup 
import requests
import json
import sys
import getopt

def get_urls(search):
    results = 10 # valid options 10, 20, 30, 40, 50, and 100
    page = requests.get(f"https://www.google.com/search?q={search}&num={results}")
    soup = BeautifulSoup(page.content, "html5lib")
    
    links = soup.findAll("a")
    url_list = []
    for link in links :
        link_href = link.get('href')
        if "url?q=" in link_href and not "webcache" in link_href:
            url_list.append(link.get('href').split("?q=")[1].split("&sa=U")[0])
            
    headers_list = []
    headers = soup.find_all('h3')
    for header in headers:
        headers_list.append(header.getText())
    
    url_list = url_list[:len(headers_list)]
    return (headers_list, url_list)
    
    
def get_content(url):
    headers = {
        'User-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)   Chrome/70.0.3538.102 Safari/537.36 Edge/18.19582"
    }
    page = requests.get(url,headers=headers)
    soup = BeautifulSoup(page.text, 'html.parser')
    article_text = ''
    article = soup.find_all('p')
    for element in article:
        article_text += '\n' + ''.join(element.findAll(text = True))
    len_ = len(article_text)
    threshold = int(len_ * 0.8)
    article_text = article_text[0:threshold]
    return article_text

def main(argv):
    company_name = ''
    dict_ = {}
    
    '''
    # parse incoming arguments
    try:
        opts, args = getopt.getopt(argv,"hf:",["url="])
    except getopt.GetoptError:
        sys.exit(2) 
    '''
    opts, args = getopt.getopt(argv,"hf:",["url="])
    for opt, arg in opts:
        if opt in ("--url"):
            company_name = arg

    list_headers_urls = get_urls('%s ethics'%company_name)
    count = 0
    for url in list_headers_urls[1]:
        if 'reddit' in url:
            continue
        content = get_content(url)
        header = list_headers_urls[0][count]
        dict_part = {"header":header, "url":url, "content":content}
        dict_['article%s'%count] = dict_part
        count += 1

    json_object = json.dumps(dict_, indent = 4) 
    with open('articles.json', 'w') as f:
        f.write(json_object)
    
      

if __name__ == "__main__":
    main(sys.argv[1:])