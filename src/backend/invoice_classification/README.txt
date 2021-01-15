############################## README ##############################
# Description 			: manuel d'utilisation de modèle Tensorflow
						  pour identifier la typologie d'une facture
# Auteur 				: OBR01 Edissyum (oussama.brich@edissyum.com)
# Date de création  	: 08-09-2020
# Dernière modification  : 10-09-2020
####################################################################

Le but est de détecter la typologie d'une facture en utilisant un modèle Tnsorflow.

# Les fichiers/répertoires fournis :

	- Le modèle (le répertoire invoice_classification.model)
	- Un script python pour montrer comment utiliser le modèle
    - Un répertoire images utilisé pour sauvegarder les images de l'apprentissage et du test

# Prérequis :

Python version 3 ou plus avec les modules suivants :

	-> Tensorflow (version testée : 2.3.0)
		commande d'installation : $ pip3 install tensorflow

	-> pdf2image
		commande d'installation : $ pip3 install pdf2image


# Détails sur le script python:

Le script python joint contient 5 fonctions ci-dessous :

    - Fonctions utilisées pour l'apprestissage
        -> convert_to_image(pdf_path, imeag_path) : cette fonction va convertir la première page du PDF vers une image

                - parametres : pdf_path = chemin du PDF de la facture
                - retour 	 : chemin de l'image jpg avec les dimensions 699 x 495 (respect des dimensions est obligatoire).

        -> predict(path_image_test) : la fonction qui permet d'utiliser le modèle Tensorflow

                - parametres : path_image_test = chemin de l'image (699*495) reoutné par la fonction convert_to_image()
                - retour 	 : le liste de prédiction le maximum de cette liste corespond au label du typologie


    - Fonctions utilisées pour prédire la typologie
        -> convert_pdf_dir_to_images(pdfs_path) : cette fonction sert à convertir le répertoire MONO-FACTURE
        vers un répertoire d'images de la première page du PDF avec les mêmes sous-répertoires.
                - parametres : pdfs_path = chemin de répertoire des factures (MONO-FACTURE)
                - retour 	 : N/A

        -> train(images_data_path) : fonction d'appretissage et d'enregistrement du modèle tensorflow
                - parametres : images_data_path = chemin de répertoire des images des factures
                - retour 	 : N/A

    - main() : Fontion du test, lesfonctions  de l'apprentissage sont en commentaire.
    cette fonction demande de saisir le chemin d'un PDF dans la console ensuite
    ça affiche la typologie qui correspond au maximum de liste de prédiction.