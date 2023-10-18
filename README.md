![Logo Open-Capture](https://open-capture.com/wp-content/uploads/2022/12/0_Open-Capture.png)

# Open-Capture ![](https://img.shields.io/github/package-json/v/edissyum/opencapture?color=97BF3D&label=Latest%20version) ![](https://img.shields.io/badge/Angular_version-16.x-blue) [![Deployement OpenCapture](https://github.com/edissyum/opencapture/actions/workflows/main.yml/badge.svg)](https://github.com/edissyum/opencapture/actions/workflows/main.yml)

<pre>
Link to the full documentation : <a href="https://kutt.it/DocumentationV2">https://kutt.it/DocumentationV2</a>
</pre>

Open-Capture is a **free and Open Source** software under **GNU General Public License v3.0**.
  
The functionnalities of Open-Capture are :
   - Fully web interface for videocoding : No installation needed on user's workstation
   - OCR On Fly. Draw a rectangle on the image, get the text directly in your input
   - The core works on Linux (tested and Debian)
   - Complex machine learning algorithms used to predict information locations from one invoice to another
   - Find suppliers into a document using VAT Number, SIRET, SIREN or IBAN
   - Find VAT Rate, no taxes amount and total taxes amount using powerful algorithm.
   - Wrote fully in Python for the backend, using Flask micro framework. Angular & Tailwind for the front
   - Already set to use **fra** or **eng** locales. Other locales could be added easily using simple json file
   - Multiple ADR (LAD) profile, using INI file
   - SIRET/SIREN & VAT number verification (Only FR for now, could be disabled in form settings)
   - Complex locale REGEX used. Easy to improve and modify

# Launch Python unit tests

Make sure you have a test custom installed using the following commands : 

    cd /var/www/html/opencapture/bin/install/
    sudo ./create_custom.sh -c test -t systemd
    
Then, go the the tests folder and launch the following commands

    cd /var/www/html/opencapture/
    python3 -m unittest discover src/backend/tests/

# LICENSE

Open-Capture is released under the GPL v3.