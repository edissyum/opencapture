![Logo Open-Capture](https://edissyum.com/wp-content/uploads/2019/08/OpenCaptureForInvoices.png)

# Open-Capture for Invoices by Edissyum
 
Version 0.3.2
  
Open-Capture is a **free and Open Source** software under **GNU General Public License v3.0**.
  
The functionnalities of Open-Capture for Invoices are :
   - Fully web interface for videocoding : No installation needed on user's workstation
   - OCR ON THE FLY. Draw a rectangle on the image, get the text directly in your input
   - The core works on Linux (Ubuntu or Debian)
   - Complex machine learning algorithms used to predict informations locations from one invoice to another
   - Find suppliers into an invoices using VAT Number, SIRET or SIREN
   - Find VAT Rate, no taxes amount and total taxes amount using powerful algorithm.
   - Wrote fully in Python for the backend, using Flask micro framework. JS/jQuery/JINJA2/CSS for the front
   - Already set to use **fr_FR** or **en_EN** locales. Other locales could be added easily using simple json file
   - Multiple ADR (LAD) profile, using INI file
   - SIRET/SIREN & Adress verification (Only FR for now, could be disabled in settings)
   - Complex locale REGEX used. Easy to improve and modify
   - You have the choice to convert PDF to TIFF or JPG. With the TIFF format the results are better but the size of files are much bigger
  
# Installation
## Linux Distributions

Tested with :
- Debian 9.8 with Python 3.5.3 & Tesseract v3.04.01 or Tesseract V4.0.0 (stretch-backports) & nginx as web server
- Debian 9.6 with Python 3.5.3 & Tesseract v3.04.01 or Tesseract V4.0.0 (stretch-backports) & nginx as web server
- Debian 10 with Python 3.7.3 Tesseract V4.0.0 & nginx as web server
  
## Install Open-Capture for Invoices

First of all, in most cases you had to modify the <code>/etc/ImageMagick-6/policy.xml</code> file to comment the following line (~ line 94) and then restart the OCForInvoices-worker service:

    <policy domain="coder" rights="none" pattern="PDF" />

(Modify the user and group if needed)

    $ sudo mkdir /opt/OpenCaptureForInvoices/ && sudo chmod -R 775 /opt/OpenCaptureForInvoices/ && sudo chown -R edissyum:edissyum /opt/OpenCaptureForInvoices/  
    $ sudo apt install git
    $ git clone -b 0.3.2 https://gitlab.com/edissyum/opencapture/opencaptureforinvoices /opt/OpenCaptureForInvoices/
    $ cd /opt/OpenCaptureForInvoices/
  
Before lauching the Makefile. You have to do the following : 

Using the following command, you have to retrieve the name of your network interface : 
    
    $ ip a
    
Then go to <code>bin/scripts/service_flaskOC.sh</code> and change the default one <code>enp0s3</code> by your interface name. This is the interface needed to run the web server. 

**It gives you the IP address where the web server will run**

Finally you have to generate a secret key for the flask web server. First, generate a random key using, for example : 
    
    $ python3 -c 'import secrets; print(secrets.token_hex(16))'
    
Copy the generated text and go to <code>webApp/\_\_init\_\_.py</code>. Find the line with <code>SECRET_KEY</code> and paste between ""   
  
The ./Makefile command create the service, but you may want to change the User and Group so just open the ./Makefile and change lines **6** & **7**
  
    $ cd bin/install/
    $ chmod u+x Makefile
    $ sudo ./Makefile
        # Go grab a coffee ;)

It will install all the needed dependencies and install Tesseract V4.0.0 with french and english locale. If you need more locales, just do :
  
    $ sudo apt install tesseract-ocr-langcode

Here is a list of all available languages code : https://www.macports.org/ports.php?by=name&substr=tesseract-

If you plan to upload invoices from the interface, using the upload form, you had to modify NGINX settings to increase the max size of upload.OCForInvoices.
Go to file <code>/etc/nginx/nginx.conf</code> and add <code>client_max_body_size 100M;</code> into the <code>http</code> bloc
Then restart the nginx service

    $ sudo systemctl restart nginx

Don't forget to create all the needed path (Modify the user and group if needed) :

    $ sudo mkdir -p /var/docservers/{OpenCapture,OpenCapture_Splitter}
    $ sudo mkdir -p /var/docservers/OpenCapture/images/{tiff,full}
    $ sudo mkdir -p /var/docservers/OpenCapture_Splitter/{batches,separated_pdf}
    $ sudo mkdir -p /var/docservers/OpenCapture/xml/
    $ sudo chmod -R 775 /var/docservers/{OpenCapture,OpenCapture_Splitter}/
    $ sudo chown -R edissyum:www-data /var/docservers/{OpenCapture,OpenCapture_Splitter}/
    
## API for SIRET/SIREN

In order to user the online verification of SIRET and SIREN you need to create a WS account on the INSEE website : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee
You need to retrieve two tokens and put them into the <code>config_DEFAULT.ini</code> file.
You also need to add a subscritpion the the SIRENE V3 applications : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/item-info.jag?name=Sirene&version=V3&provider=insee
This is the consumer key and the consumer secret. You could find help on the INSEE website : https://api.insee.fr/catalogue/site/themes/wso2/subthemes/insee/pages/help.jag
    
## Supplier's referencial

Before starting using Open-Capture you need to create a spreadsheet of your suppliers. You could find a demo located here : <code>bin/src/referencial/default_referencial_supplier.ods</code> (works with .ods or .xlsx). 
You just have to fill the supplier name, siret, siren, vat number and adress informations. This .ods is bundled with <code>bin/src/referencial/default_referencial_supplier_index.json</code>.
If your supplier referencial had different column name, the .json file is here for that. You just have to replace the right side of the array with the new column name.

Then, just launch :

    $ python3 /opt/OpenCaptureForInvoices/loadReferencial.py -c /opt/OpenCaptureForInvoices/instance/config.ini
    
It will fill the database with the suppliers informations.

## Set up the incron & the cron to start the service
We want to automatise the capture of document. For that, we'll use incrontab.
First, add your user into the following file :

> /etc/incron.allow

Then use <code>incrontab -e</code> and put the following line :

    /path/to/capture/ IN_CLOSE_WRITE,IN_MOVED_TO /opt/OpenCaptureForInvoices/scripts/launch_DEFAULT.sh $@/$#

## Custom development
You can modify a lot of files if needed, without loose everything at every update. For that, you have to modify the <code>custom/custom.ini</code> file to add the id (between the brackets)
of your custom and the path. By default for the path it's <code>custom/YOUR_CUSTOM_ID/</code> and if it's enabled or not. You can put multiple custom. Then you just have to recreate the
tree of files into the <code>custom/YOUR_CUSTOM_ID/</code> folder. Though, be careful with the import that maybe needed to be modified because the path is modified

Your could custom python files, templates files and static files (js, css, imgs, babel locales)

For now (and for somes files like babel's or webApp/*.py files) it is recommended to restart Flask service in order to see the changes :

    $ systemctl restart OCForInvoices-web.service

## WebServices for Maarch 19.04

The list of files needed to be modify is in install/Maarch with the correct structure. Each modifications on files are between the following tags :

    // NCH01
        some code...
    // END NCH01

Just report the modifications onto you Maarch installation

## Connexion to web client

By default, there is ony one superadmin account. Login is 'admin' and password is 'admin'. You could change it after using the 'My Profile' menu

# Installation Splitter module

Splitter module is a part from OC for invoice project, the goal is to separate invoices automatically.

It will use a lot of metadata to be able to separate invoices without physical separator : 
    - Invoice number
    - VAT Number of supplier
    - Number of page if available
    
When the separation is done, you could access to a web interface to control the separation and modify it if needed. After separate invoices, Open-Capture for Invocies will process them normally

In the default <code>config_DEFAULT.ini</code> file there is a SPLITTER part : 
    - splitterpath : Path to the specific docserver of separation
    - tmpBatchPath : Path to the currently running batches
    - pdfOutputPath : Path for the separated PDF. Need to be a folder currently watching by Open-Capture For Invoices 
    - pdfOriginPath : Path to keep the original PDF files (without any separation)
    - allowedExtensions : Files extensions allowed, JSON format  
    
## Launch manually

Obviously you could launch the separation by the web using the "Download" page. But you also could launch separation using bash script combined with incron.
Here is an example of incrontab : 

    /path/to/capture/ IN_CLOSE_WRITE,IN_MOVED_TO /opt/OpenCaptureForInvoices/scripts/launch_SPLITTER.sh $@/$#
    
# LICENSE
Open-Capture for Maarch is released under the GPL v3.