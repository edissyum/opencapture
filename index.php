<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset=UTF-8>
        <title>Open-Capture</title>
        <link rel="icon" type="image/x-icon" href="src/assets/imgs/favicon.ico">
    </head>
    <style>
        .instances_title h2{
            margin: 40px;
            text-align: center;
        }

        .instances_title hr {
            width: 30%;
            color: #97BF3D;
            margin-bottom: 40px;
        }

        .customs_list {
            text-align: center;
        }

        .customs_list a {
            color: #97BF3D;
            text-decoration: none;
        }

        .customs_list button {
            background-color: #4C4A4E;
            color: #97BF3D;
            border-radius: 0;
            padding: 20px;
            border: 0;
            cursor: pointer;
            margin: 10px;
        }
    </style>
    <body>
        <?php
            $customsDir = 'custom/';
            $customs = array_values(array_diff(scandir($customsDir), array('..', '.', 'custom.ini', 'custom.ini.default')));
            if (count($customs) == 1) {
                echo '<script>';
                echo 'let currentUrl = window.location.href.split("/").filter(elem => elem);';
                echo 'let lastUrlElement = currentUrl[currentUrl.length - 1];';
                echo 'if (lastUrlElement !== "' . $customs[0] . '") {';
                echo '    location.href = "' . $customs[0] . '/dist";';
                echo '} else {';
                echo '    location.href = "dist";';
                echo '}';
                echo '</script>';
            }
            exit();
        ?>
        <div class="instances_title">
            <h2>Liste des instances installées :</h2>
            <hr>
        </div>
        <div class="customs_list">
            <?php
                $customCpt = 0;
                foreach($customs as $custom) {
                    if (is_dir($custom)) {
                        $customCpt += 1;
                        ?>
                            <a href="<?php echo $custom; ?>/dist">
                                <button>
                                    <?php echo $custom; ?>
                                </button>
                            </a>
                        <?php
                    }
                }

                if ($customCpt == 0) {
                    ?>
                        <span>
                            Aucune instance n'est configurée. Merci de vous référer à la
                            <a target="_blank" href="https://kutt.it/DocumentationCreateInstance">documentation officielle</a>
                            pour en créer une
                        </span>
                    <?php
                }
            ?>
        </div>
    </body>
</html>
