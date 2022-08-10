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

<div class="instances_title">
    <h2>Liste des instances installées :</h2>
    <hr>
</div>
<div class="customs_list">
    <?php
        $customsDir = 'custom/';
        $customs = array_diff(scandir($customsDir), array('..', '.'));
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
