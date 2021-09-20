import os
import base64
import zipfile

from pyasice import Container, XmlSignature


filename = 'output6'

def base64txt2asice():
  with open(filename + '.txt', 'rb') as infile:
    with open(filename + '.asice', 'wb') as outfile:
      print(base64.decode(infile, outfile))


def listAsice():
  #container = Container.open('/Users/pom/Downloads/aaa-test-aaa.asice')
  container = Container.open(filename + '.asice')
  print(container.verify_signatures())
  print(list(container.iter_data_files()))
  for xmlsig in container.iter_signatures():
      print(xmlsig)
      print(xmlsig.dump())
      print(xmlsig.get_signing_time())


def unzipAsice():
    with zipfile.ZipFile(filename+'.asice', 'r') as zipref:
        zipref.extractall(filename + '.unzip')

def main():
    base64txt2asice()
    unzipAsice()
    listAsice()



if __name__ == "__main__":
  main()
