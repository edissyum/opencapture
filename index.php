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
<script>
    function isValidFQDN(str) {
        return /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)/g.test(str);
    }
</script>
<body>
    <?php
        $customsDir = 'custom/';
        $customs = array_values(array_diff(scandir($customsDir), array('..', '.', 'custom.ini', 'custom.ini.default')));
        if (count($customs) == 1) {
            ?>
                <script>
                    let currentUrl = window.location.href.replaceAll('http:', '').replaceAll('https:', '').split("/").filter(elem => elem);
                    const currentCustom = '<?php echo $customs[0]; ?>';
                    if (isValidFQDN(currentUrl[0])) {
                        const fqdn = currentUrl[0].replaceAll('.', '_').replaceAll('-','_');
                        if (fqdn === currentCustom) {
                            location.href = "dist";
                        }
                    }

                    let lastUrlElement = currentUrl[currentUrl.length - 1];
                    if (lastUrlElement !== currentCustom) {
                        location.href = currentCustom + '/dist';
                    } else {
                        location.href = "dist";
                    }
                </script>
            <?php
        }
    ?>
    <div class="instances_title">
        <h2>Liste des instances installées :</h2>
        <hr>
    </div>
    <div class="customs_list">
        <?php
            function isValidDomainName($domain) {
                return preg_match('/(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)/', $domain);
            }
            $current_url = sprintf(
                '%s://%s/%s',
                isset($_SERVER['HTTPS']) ? 'https' : 'http',
                $_SERVER['HTTP_HOST'],
                $_SERVER['REQUEST_URI']
            );
            $current_url = str_replace('http://', '', $current_url);
            $current_url = str_replace('https://', '', $current_url);
            $current_url = str_replace('https://', '', $current_url);
            $current_url = preg_replace('~/+~', '/', $current_url);
            $current_fqdn = explode('/', $current_url)[0];

            $customCpt = 0;
            foreach($customs as $custom) {
                if (is_dir($custom)) {
                    $customCpt += 1;
                    $current_fqdn_clean = preg_replace('/\./', '_', $current_fqdn);
                    $current_fqdn_clean = preg_replace('/-/', '_', $current_fqdn_clean);

                    if (isValidDomainName($current_fqdn) && $current_fqdn_clean == $custom) {
                        ?>
                        <a href="dist">
                            <button>
                                <?php echo $custom; ?>
                            </button>
                        </a>
                        <?php
                    } else {
                        ?>
                        <a href="<?php echo $custom; ?>/dist">
                            <button>
                                <?php echo $custom; ?>
                            </button>
                        </a>
                        <?php
                    }
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
