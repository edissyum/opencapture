<?php

/**
* Copyright Maarch since 2008 under licence GPLv3.
* See LICENCE.txt file at the root folder for more details.
* This file is part of Maarch software.
*
*/

/**
* @brief User Controller
* @author dev@maarch.org
*/

namespace User\controllers;

use Basket\models\BasketModel;
use Basket\models\GroupBasketModel;
use Basket\models\RedirectBasketModel;
use Docserver\controllers\DocserverController;
use Docserver\models\DocserverModel;
use Entity\models\ListInstanceModel;
use Group\models\ServiceModel;
use Entity\models\EntityModel;
use Entity\models\ListTemplateModel;
use Group\models\GroupModel;
use History\controllers\HistoryController;
use History\models\HistoryModel;
use Notification\controllers\NotificationsEventsController;
use Parameter\models\ParameterModel;
use Resource\controllers\ResController;
use Resource\models\ResModel;
use Respect\Validation\Validator;
use Slim\Http\Request;
use Slim\Http\Response;
use SrcCore\controllers\PasswordController;
use SrcCore\models\AuthenticationModel;
use SrcCore\models\CoreConfigModel;
use SrcCore\models\DatabaseModel;
use SrcCore\models\PasswordModel;
use User\models\UserBasketPreferenceModel;
use User\models\UserEntityModel;
use User\models\UserModel;
use User\models\UserSignatureModel;

class UserController
{
    const ALTERNATIVES_CONNECTIONS_METHODS = ['sso', 'cas', 'ldap', 'ozwillo', 'shibboleth'];

    // NCH01

    public function getByGroup(Request $request, Response $response){
        $data = $request-> getParams();
        $group_id = $data['group'];

        $aUsers = DatabaseModel::select([
            'select'    => ['id', 'users.user_id', 'firstname', 'lastname', 'status', 'status', 'mail', 'entity_id'],
            'table'     => ['users', 'users_entities', 'usergroup_content'], // NCH01 add usergroup_content
            'left_join' => ['users.user_id = users_entities.user_id', 'users.id = usergroup_content.user_id'],
            'where'     => ['users.user_id NOT IN (?)', 'status != ?', "entity_id <> ''", 'group_id = ?'],
            'data'      => ['superadmin', 'DEL', $group_id]
        ]);

        return $response->withJson(['users' => $aUsers]);
    }

    // END NCH01

    public function get(Request $request, Response $response)
    {
       
        $data = $request-> getParams();
        
        if ($data['group'] != NULL){
            $group_id = $data['group'];
            $where = ['users.user_id NOT IN (?, ?)', 'status != ?', "entity_id <> ''", 'group_id = ?'];
            $data  = ['superadmin', 'edissyumws', 'DEL', $group_id];
        }
        else{
            $where = ['users.user_id NOT IN (?, ?)', 'status != ?', "entity_id <> ''"];
            $data  = ['superadmin', 'edissyumws', 'DEL'];
        }


        if (!ServiceModel::hasService(['id' => 'admin_users', 'userId' => $GLOBALS['userId'], 'location' => 'apps', 'type' => 'admin'])) {
            return $response->withStatus(403)->withJson(['errors' => 'Service forbidden']);
        }

        if ($GLOBALS['userId'] == 'superadmin' || $GLOBALS['userId'] == 'edissyumws') { 
            $users = UserModel::get([
                'select'    => ['id', 'users.user_id', 'firstname', 'lastname', 'status', 'enabled', 'mail', 'entity_id'],
                'table'     => ['users', 'users_entities', 'usergroup_content'], 
                'left_join' => ['users.user_id = users_entities.user_id', 'users.user_id = usergroup_content.user_id'],
                'where'     => $where,
                'data'      => $data
            ]);
        } else {
            $entities = EntityModel::getAllEntitiesByUserId(['userId' => $GLOBALS['userId']]);
            $users = [];
            if (!empty($entities)) {
                $users = UserEntityModel::getWithUsers([
                    'select'    => ['DISTINCT users.id', 'users.user_id', 'firstname', 'lastname', 'status', 'enabled', 'mail'],
                    'where'     => ['users_entities.entity_id in (?)', 'status != ?'],
                    'data'      => [$entities, 'DEL']
                ]);
            }
            $usersNoEntities = UserEntityModel::getUsersWithoutEntities(['select' => ['id', 'users.user_id', 'firstname', 'lastname', 'status', 'enabled', 'mail']]);
            $users = array_merge($users, $usersNoEntities);
        }

        $usersIds = [];
        foreach ($users as $value) {
            $usersIds[] = $value['user_id'];
        }

        $quota = [];
        $userQuota = ParameterModel::getById(['id' => 'user_quota', 'select' => ['param_value_int']]);
        if (!empty($userQuota['param_value_int'])) {
            $activeUser = UserModel::get(['select' => ['count(1)'], 'where' => ['enabled = ?', 'status = ?', 'user_id <> ?'], 'data' => ['Y', 'OK','superadmin']]);
            $inactiveUser = UserModel::get(['select' => ['count(1)'], 'where' => ['enabled = ?', 'status = ?', 'user_id <> ?'], 'data' => ['N', 'OK','superadmin']]);
            $quota = ['actives' => $activeUser[0]['count'], 'inactives' => $inactiveUser[0]['count'], 'userQuota' => $userQuota['param_value_int']];
        }

        return $response->withJson(['users' => $users, 'quota' => $quota]);
    }

    public function getDetailledById(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['id', 'user_id', 'firstname', 'lastname', 'status', 'enabled', 'phone', 'mail', 'initials', 'loginmode', 'external_id']]);
        $user['external_id']        = json_decode($user['external_id'], true);
        $user['signatures']         = UserSignatureModel::getByUserSerialId(['userSerialid' => $aArgs['id']]);
        $user['emailSignatures']    = UserModel::getEmailSignaturesById(['userId' => $user['user_id']]);
        $user['groups']             = UserModel::getGroupsByUserId(['userId' => $user['user_id']]);
        $user['allGroups']          = GroupModel::getAvailableGroupsByUserId(['userId' => $user['user_id']]);
        $user['entities']           = UserModel::getEntitiesById(['userId' => $user['user_id']]);
        $user['allEntities']        = EntityModel::getAvailableEntitiesForAdministratorByUserId(['userId' => $user['user_id'], 'administratorUserId' => $GLOBALS['userId']]);
        $user['baskets']            = BasketModel::getBasketsByLogin(['login' => $user['user_id'], 'unneededBasketId' => ['IndexingBasket']]);
        $user['assignedBaskets']    = RedirectBasketModel::getAssignedBasketsByUserId(['userId' => $user['id']]);
        $user['redirectedBaskets']  = RedirectBasketModel::getRedirectedBasketsByUserId(['userId' => $user['id']]);
        $user['history']            = HistoryModel::getByUserId(['userId' => $user['user_id'], 'select' => ['event_type', 'event_date', 'info', 'remote_ip']]);
        $user['canModifyPassword']  = false;
        $user['canResetPassword']   = true;
        $user['canCreateMaarchParapheurUser'] = false;

        $loggingMethod = CoreConfigModel::getLoggingMethod();
        if (in_array($loggingMethod['id'], self::ALTERNATIVES_CONNECTIONS_METHODS) && $user['loginmode'] != 'restMode') {
            $user['canResetPassword'] = false;
        }
        if ($user['loginmode'] == 'restMode') {
            $user['canModifyPassword'] = true;
        }
        $loadedXml = CoreConfigModel::getXmlLoaded(['path' => 'modules/visa/xml/remoteSignatoryBooks.xml']);
        if ((string)$loadedXml->signatoryBookEnabled == 'maarchParapheur' && $user['loginmode'] != 'restMode' && empty($user['external_id']['maarchParapheur'])) {
            $user['canCreateMaarchParapheurUser'] = true;
        }

        return $response->withJson($user);
    }

    public function create(Request $request, Response $response)
    {
        if (!ServiceModel::hasService(['id' => 'admin_users', 'userId' => $GLOBALS['userId'], 'location' => 'apps', 'type' => 'admin'])) {
            return $response->withStatus(403)->withJson(['errors' => 'Service forbidden']);
        }

        $data = $request->getParams();

        $check = Validator::stringType()->notEmpty()->validate($data['userId']) && preg_match("/^[\w.@-]*$/", $data['userId']);
        $check = $check && Validator::stringType()->notEmpty()->validate($data['firstname']);
        $check = $check && Validator::stringType()->notEmpty()->validate($data['lastname']);
        $check = $check && (empty($data['mail']) || filter_var($data['mail'], FILTER_VALIDATE_EMAIL));
        $check = $check && (empty($data['phone']) || preg_match("/\+?((|\ |\.|\(|\)|\-)?(\d)*)*\d$/", $data['phone']));
        if (!$check) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }

        $existingUser = UserModel::getByLowerLogin(['login' => $data['userId'], 'select' => ['id', 'status']]);

        if (!empty($existingUser) && $existingUser['status'] == 'DEL') {
            UserModel::updateStatus(['id' => $existingUser['id'], 'status' => 'OK']);
            UserModel::update([
                'set'   => [
                    'enabled'   => 'Y'
                ],
                'where' => ['id = ?'],
                'data'  => [$existingUser['id']]
            ]);

            return $response->withJson(['user' => $existingUser]);
        } elseif (!empty($existingUser)) {
            return $response->withStatus(400)->withJson(['errors' => _USER_ID_ALREADY_EXISTS]);
        }

        $logingModes = ['standard', 'restMode'];
        if (!in_array($data['loginmode'], $logingModes)) {
            $data['loginmode'] = 'standard';
        }

        if ($data['loginmode'] == 'restMode') {
            $data['changePassword']= 'N';
        }

        UserModel::create(['user' => $data]);

        $newUser = UserModel::getByLogin(['login' => $data['userId']]);
        if (!Validator::intType()->notEmpty()->validate($newUser['id'])) {
            return $response->withStatus(500)->withJson(['errors' => 'User Creation Error']);
        }

        $userQuota = ParameterModel::getById(['id' => 'user_quota', 'select' => ['param_value_int']]);
        if (!empty($userQuota['param_value_int'])) {
            $activeUser = UserModel::get(['select' => ['count(1)'], 'where' => ['enabled = ?', 'status = ?', 'user_id <> ?'], 'data' => ['Y', 'OK','superadmin']]);
            if ($activeUser[0]['count'] > $userQuota['param_value_int']) {
                NotificationsEventsController::fillEventStack(['eventId' => 'user_quota', 'tableName' => 'users', 'recordId' => 'quota_exceed', 'userId' => 'superadmin', 'info' => _QUOTA_EXCEEDED]);
            }
        }

        HistoryController::add([
            'tableName'    => 'users',
            'recordId'     => $GLOBALS['userId'],
            'eventType'    => 'ADD',
            'eventId'      => 'userCreation',
            'info'         => _USER_CREATED . " {$data['userId']}"
        ]);

        return $response->withJson(['user' => $newUser]);
    }

    public function update(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $data = $request->getParams();

        $check = Validator::stringType()->notEmpty()->validate($data['firstname']);
        $check = $check && Validator::stringType()->notEmpty()->validate($data['lastname']);
        $check = $check && (empty($data['mail']) || filter_var($data['mail'], FILTER_VALIDATE_EMAIL));
        $check = $check && (empty($data['phone']) || preg_match("/\+?((|\ |\.|\(|\)|\-)?(\d)*)*\d$/", $data['phone']));
        if (!$check) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }

        $set = [
            'firstname' => $data['firstname'],
            'lastname'  => $data['lastname'],
            'mail'      => $data['mail'],
            'phone'     => $data['phone'],
            'initials'  => $data['initials'],
            'loginmode' => empty($data['loginmode']) ? 'standard' : $data['loginmode'],
        ];
        if (!empty($data['enabled']) && $data['enabled'] == 'Y') {
            $set['enabled'] = 'Y';
        }

        if ($set['loginmode'] == 'restMode') {
            $set['change_password']= 'N';
        }

        $userQuota = ParameterModel::getById(['id' => 'user_quota', 'select' => ['param_value_int']]);
        $user = [];
        if (!empty($userQuota['param_value_int'])) {
            $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['enabled']]);
        }

        UserModel::update([
            'set'   => $set,
            'where' => ['id = ?'],
            'data'  => [$aArgs['id']]
        ]);

        if (!empty($userQuota['param_value_int'])) {
            if ($user['enabled'] == 'N' && $data['enabled'] == 'Y') {
                $activeUser = UserModel::get(['select' => ['count(1)'], 'where' => ['enabled = ?', 'status = ?', 'user_id != ?'], 'data' => ['Y', 'OK', 'superadmin']]);
                if ($activeUser[0]['count'] > $userQuota['param_value_int']) {
                    NotificationsEventsController::fillEventStack(['eventId' => 'user_quota', 'tableName' => 'users', 'recordId' => 'quota_exceed', 'userId' => 'superadmin', 'info' => _QUOTA_EXCEEDED]);
                }
            }
        }

        HistoryController::add([
            'tableName'    => 'users',
            'recordId'     => $GLOBALS['userId'],
            'eventType'    => 'UP',
            'eventId'      => 'userModification',
            'info'         => _USER_UPDATED . " {$data['firstname']} {$data['lastname']}"
        ]);

        return $response->withStatus(204);
    }

    public function isDeletable(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'delete' => true, 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['firstname', 'lastname', 'user_id']]);

        $isListInstanceDeletable = true;
        $isListTemplateDeletable = true;

        $listInstanceEntities = [];
        $listInstanceResIds = [];
        $listInstances = ListInstanceModel::getWhenOpenMailsByLogin(['select' => ['listinstance.res_id', 'res_letterbox.destination'], 'login' => $user['user_id'], 'itemMode' => 'dest']);
        foreach ($listInstances as $listInstance) {
            if (!ResController::hasRightByResId(['resId' => [$listInstance['res_id']], 'userId' => $GLOBALS['userId']])) {
                $isListInstanceDeletable = false;
            }
            $listInstanceResIds[] = $listInstance['res_id'];
            if (!empty($listInstance['destination'])) {
                $listInstanceEntities[] = $listInstance['destination'];
            }
        }

        $listTemplateEntities = [];
        $listTemplates = ListTemplateModel::get([
            'select'    => ['object_id', 'title'],
            'where'     => ['item_id = ?', 'object_type = ?', 'item_mode = ?', 'item_type = ?'],
            'data'      => [$user['user_id'], 'entity_id', 'dest', 'user_id']
        ]);
        $allEntities = EntityModel::getAllEntitiesByUserId(['userId' => $GLOBALS['userId']]);
        foreach ($listTemplates as $listTemplate) {
            if (!in_array($listTemplate['object_id'], $allEntities)) {
                $isListTemplateDeletable = false;
            }
            $listTemplateEntities[] = $listTemplate['object_id'];
        }

        if (!$isListInstanceDeletable || !$isListTemplateDeletable) {
            $formattedLIEntities = [];
            $listInstanceEntities = array_unique($listInstanceEntities);
            foreach ($listInstanceEntities as $listInstanceEntity) {
                $entity = Entitymodel::getByEntityId(['select' => ['short_label'], 'entityId' => $listInstanceEntity]);
                $formattedLIEntities[] = $entity['short_label'];
            }
            $formattedLTEntities = [];
            $listTemplateEntities = array_unique($listTemplateEntities);
            foreach ($listTemplateEntities as $listTemplateEntity) {
                $entity = Entitymodel::getByEntityId(['select' => ['short_label'], 'entityId' => $listTemplateEntity]);
                $formattedLTEntities[] = $entity['short_label'];
            }

            return $response->withJson(['isDeletable' => false, 'listInstanceEntities' => $formattedLIEntities, 'listTemplateEntities' => $formattedLTEntities]);
        }

        $listInstances = [];
        foreach ($listInstanceResIds as $listInstanceResId) {
            $rawListInstances = ListInstanceModel::get([
                'select'    => ['*'],
                'where'     => ['res_id = ?', 'difflist_type = ?'],
                'data'      => [$listInstanceResId, 'entity_id'],
                'orderBy'   => ['listinstance_id']
            ]);
            $listInstances[] = [
                'resId'         => $listInstanceResId,
                'listInstances' => $rawListInstances
            ];
        }

        return $response->withJson(['isDeletable' => true, 'listTemplates' => $listTemplates, 'listInstances' => $listInstances]);
    }

    public function suspend(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'delete' => true, 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['firstname', 'lastname', 'user_id']]);

        $listInstances = ListInstanceModel::getWhenOpenMailsByLogin(['select' => [1], 'login' => $user['user_id'], 'itemMode' => 'dest']);
        if (!empty($listInstances)) {
            return $response->withStatus(403)->withJson(['errors' => 'User is still present in listInstances']);
        }

        $listTemplates = ListTemplateModel::get([
            'select'    => [1],
            'where'     => ['item_id = ?', 'object_type = ?', 'item_type = ?', 'item_mode = ?'],
            'data'      => [$user['user_id'], 'entity_id', 'user_id', 'dest']
        ]);
        if (!empty($listTemplates)) {
            return $response->withStatus(403)->withJson(['errors' => 'User is still present in listTemplates']);
        }

        ListInstanceModel::delete([
            'where' => ['item_id = ?', 'difflist_type = ?', 'item_type = ?', 'item_mode != ?'],
            'data'  => [$user['user_id'], 'entity_id', 'user_id', 'dest']
        ]);
        ListTemplateModel::delete([
            'where' => ['item_id = ?', 'object_type = ?', 'item_type = ?'],
            'data'  => [$user['user_id'], 'entity_id', 'user_id']
        ]);
        RedirectBasketModel::delete([
            'where' => ['owner_user_id = ? OR actual_user_id = ?'],
            'data'  => [$aArgs['id'], $aArgs['id']]
        ]);

        UserModel::update([
            'set'   => [
                'enabled'   => 'N'
            ],
            'where' => ['id = ?'],
            'data'  => [$aArgs['id']]
        ]);

        HistoryController::add([
            'tableName'    => 'users',
            'recordId'     => $GLOBALS['userId'],
            'eventType'    => 'DEL',
            'eventId'      => 'userSuppression',
            'info'         => _USER_SUSPENDED . " {$user['firstname']} {$user['lastname']}"
        ]);

        return $response->withStatus(204);
    }

    public function delete(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'delete' => true, 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['firstname', 'lastname', 'user_id']]);

        $listInstances = ListInstanceModel::getWhenOpenMailsByLogin(['select' => [1], 'login' => $user['user_id'], 'itemMode' => 'dest']);
        if (!empty($listInstances)) {
            return $response->withStatus(403)->withJson(['errors' => 'User is still present in listInstances']);
        }

        $listTemplates = ListTemplateModel::get([
            'select'    => [1],
            'where'     => ['item_id = ?', 'object_type = ?', 'item_type = ?', 'item_mode = ?'],
            'data'      => [$user['user_id'], 'entity_id', 'user_id', 'dest']
        ]);
        if (!empty($listTemplates)) {
            return $response->withStatus(403)->withJson(['errors' => 'User is still present in listTemplates']);
        }

        ListInstanceModel::delete([
            'where' => ['item_id = ?', 'difflist_type = ?', 'item_type = ?', 'item_mode != ?'],
            'data'  => [$user['user_id'], 'entity_id', 'user_id', 'dest']
        ]);
        ListTemplateModel::delete([
            'where' => ['item_id = ?', 'object_type = ?', 'item_type = ?'],
            'data'  => [$user['user_id'], 'entity_id', 'user_id']
        ]);
        RedirectBasketModel::delete([
            'where' => ['owner_user_id = ? OR actual_user_id = ?'],
            'data'  => [$aArgs['id'], $aArgs['id']]
        ]);

        UserModel::delete(['id' => $aArgs['id']]);

        HistoryController::add([
            'tableName'    => 'users',
            'recordId'     => $GLOBALS['userId'],
            'eventType'    => 'DEL',
            'eventId'      => 'userSuppression',
            'info'         => _USER_DELETED . " {$user['firstname']} {$user['lastname']}"
        ]);

        return $response->withStatus(204);
    }

    public function getProfile(Request $request, Response $response)
    {
        $user = UserModel::getByLogin(['login' => $GLOBALS['userId'], 'select' => ['id', 'user_id', 'firstname', 'lastname', 'phone', 'mail', 'initials', 'external_id']]);
        $user['external_id']        = json_decode($user['external_id'], true);
        $user['signatures']         = UserSignatureModel::getByUserSerialId(['userSerialid' => $user['id']]);
        $user['emailSignatures']    = UserModel::getEmailSignaturesById(['userId' => $user['user_id']]);
        $user['groups']             = UserModel::getGroupsByUserId(['userId' => $user['user_id']]);
        $user['entities']           = UserModel::getEntitiesById(['userId' => $user['user_id']]);
        $user['baskets']            = BasketModel::getBasketsByLogin(['login' => $user['user_id'], 'unneededBasketId' => ['IndexingBasket']]);
        $user['assignedBaskets']    = RedirectBasketModel::getAssignedBasketsByUserId(['userId' => $user['id']]);
        $user['redirectedBaskets']  = RedirectBasketModel::getRedirectedBasketsByUserId(['userId' => $user['id']]);
        $user['regroupedBaskets']   = BasketModel::getRegroupedBasketsByUserId(['userId' => $user['user_id']]);
        $user['passwordRules']      = PasswordModel::getEnabledRules();
        $user['canModifyPassword']  = true;

        $loggingMethod = CoreConfigModel::getLoggingMethod();
        if (in_array($loggingMethod['id'], self::ALTERNATIVES_CONNECTIONS_METHODS)) {
            $user['canModifyPassword'] = false;
        }

        return $response->withJson($user);
    }

    public function updateProfile(Request $request, Response $response)
    {
        $user = UserModel::getByLogin(['login' => $GLOBALS['userId'], 'select' => ['id']]);

        $data = $request->getParams();

        $check = Validator::stringType()->notEmpty()->validate($data['firstname']);
        $check = $check && Validator::stringType()->notEmpty()->validate($data['lastname']);
        $check = $check && (empty($data['mail']) || filter_var($data['mail'], FILTER_VALIDATE_EMAIL));
        $check = $check && (empty($data['phone']) || preg_match("/\+?((|\ |\.|\(|\)|\-)?(\d)*)*\d/", $data['phone']));
        if (!$check) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }

        UserModel::update([
            'set'   => [
                'firstname' => $data['firstname'],
                'lastname'  => $data['lastname'],
                'mail'      => $data['mail'],
                'phone'     => $data['phone'],
                'initials'  => $data['initials']
            ],
            'where' => ['id = ?'],
            'data'  => [$user['id']]
        ]);

        return $response->withJson(['success' => 'success']);
    }

    public function resetPassword(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        UserModel::resetPassword(['id' => $aArgs['id']]);

        return $response->withJson(['success' => 'success']);
    }

    public function updatePassword(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $body = $request->getParsedBody();

        $check = Validator::stringType()->notEmpty()->validate($body['currentPassword']);
        $check = $check && Validator::stringType()->notEmpty()->validate($body['newPassword']);
        $check = $check && Validator::stringType()->notEmpty()->validate($body['reNewPassword']);
        if (!$check) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id', 'loginmode']]);
        if ($user['loginmode'] != 'restMode' && $user['user_id'] != $GLOBALS['userId']) {
            return $response->withStatus(403)->withJson(['errors' => 'Not allowed']);
        }

        if ($body['newPassword'] != $body['reNewPassword']) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        } elseif (!AuthenticationModel::authentication(['userId' => $user['user_id'], 'password' => $body['currentPassword']])) {
            return $response->withStatus(401)->withJson(['errors' => _WRONG_PSW]);
        } elseif (!PasswordController::isPasswordValid(['password' => $body['newPassword']])) {
            return $response->withStatus(400)->withJson(['errors' => 'Password does not match security criteria']);
        } elseif (!PasswordModel::isPasswordHistoryValid(['password' => $body['newPassword'], 'userSerialId' => $aArgs['id']])) {
            return $response->withStatus(400)->withJson(['errors' => _ALREADY_USED_PSW]);
        }

        UserModel::updatePassword(['id' => $aArgs['id'], 'password' => $body['newPassword']]);
        PasswordModel::setHistoryPassword(['userSerialId' => $aArgs['id'], 'password' => $body['newPassword']]);

        HistoryController::add([
            'tableName'    => 'users',
            'recordId'     => $user['user_id'],
            'eventType'    => 'UP',
            'eventId'      => 'userModification',
            'info'         => _USER_PASSWORD_UPDATED
        ]);

        return $response->withJson(['success' => 'success']);
    }

    public function setRedirectedBaskets(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $data = $request->getParams();

        DatabaseModel::beginTransaction();
        foreach ($data as $key => $value) {
            if (empty($value['actual_user_id']) || empty($value['basket_id']) || empty($value['group_id'])) {
                DatabaseModel::rollbackTransaction();
                return $response->withStatus(400)->withJson(['errors' => 'Some data are empty']);
            }

            $check = UserModel::getById(['id' => $value['actual_user_id'], 'select' => ['1']]);
            if (empty($check)) {
                DatabaseModel::rollbackTransaction();
                return $response->withStatus(400)->withJson(['errors' => 'User not found']);
            }

            $check = RedirectBasketModel::get([
                'select' => [1],
                'where'  => ['actual_user_id = ?', 'owner_user_id = ?', 'basket_id = ?', 'group_id = ?'],
                'data'   => [$value['actual_user_id'], $aArgs['id'], $value['basket_id'], $value['group_id']]
            ]);
            if (!empty($check)) {
                DatabaseModel::rollbackTransaction();
                return $response->withStatus(400)->withJson(['errors' => 'Redirection already exist']);
            }

            if (!empty($value['originalOwner'])) {
                RedirectBasketModel::update([
                    'actual_user_id'    => $value['actual_user_id'],
                    'basket_id'         => $value['basket_id'],
                    'group_id'          => $value['group_id'],
                    'owner_user_id'     => $value['originalOwner']
                ]);
                HistoryController::add([
                    'tableName'    => 'redirected_baskets',
                    'recordId'     => $GLOBALS['userId'],
                    'eventType'    => 'UP',
                    'eventId'      => 'basketRedirection',
                    'info'         => _BASKET_REDIRECTION . " {$value['basket_id']} {$value['actual_user_id']}"
                ]);
                unset($data[$key]);
            }
        }

        if (!empty($data)) {
            foreach ($data as $value) {
                RedirectBasketModel::create([
                    'actual_user_id'    => $value['actual_user_id'],
                    'basket_id'         => $value['basket_id'],
                    'group_id'          => $value['group_id'],
                    'owner_user_id'     => $aArgs['id']
                ]);
                HistoryController::add([
                    'tableName'    => 'redirected_baskets',
                    'recordId'     => $GLOBALS['userId'],
                    'eventType'    => 'UP',
                    'eventId'      => 'basketRedirection',
                    'info'         => _BASKET_REDIRECTION . " {$value['basket_id']} {$aArgs['id']} => {$value['actual_user_id']}"
                ]);
            }
        }

        DatabaseModel::commitTransaction();

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);

        return $response->withJson([
            'redirectedBaskets' => RedirectBasketModel::getRedirectedBasketsByUserId(['userId' => $aArgs['id']]),
            'baskets'           => BasketModel::getBasketsByLogin(['login' => $user['user_id'], 'unneededBasketId' => ['IndexingBasket']])
        ]);
    }

    public function deleteRedirectedBasket(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $data = $request->getQueryParams();

        DatabaseModel::beginTransaction();

        $check = Validator::notEmpty()->arrayType()->validate($data['redirectedBasketIds']);
        if (!$check) {
            DatabaseModel::rollbackTransaction();
            return $response->withStatus(400)->withJson(['errors' => 'RedirectedBasketIds is empty or not an array']);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);
        if (empty($user)) {
            DatabaseModel::rollbackTransaction();
            return $response->withStatus(400)->withJson(['errors' => 'User not found']);
        }

        foreach ($data['redirectedBasketIds'] as $redirectedBasketId) {
            $redirectedBasket = RedirectBasketModel::get(['select' => ['actual_user_id', 'owner_user_id', 'basket_id'], 'where' => ['id = ?'], 'data' => [$redirectedBasketId]]);
            if (empty($redirectedBasket[0]) || ($redirectedBasket[0]['actual_user_id'] != $aArgs['id'] && $redirectedBasket[0]['owner_user_id'] != $aArgs['id'])) {
                DatabaseModel::rollbackTransaction();
                return $response->withStatus(403)->withJson(['errors' => 'Redirected basket out of perimeter']);
            }

            RedirectBasketModel::delete(['where' => ['id = ?'], 'data' => [$redirectedBasketId]]);

            HistoryController::add([
                'tableName'    => 'redirected_baskets',
                'recordId'     => $GLOBALS['userId'],
                'eventType'    => 'DEL',
                'eventId'      => 'basketRedirection',
                'info'         => _BASKET_REDIRECTION_SUPPRESSION . " {$user['user_id']} : " . $redirectedBasket[0]['basket_id']
            ]);
        }

        DatabaseModel::commitTransaction();

        return $response->withJson([
            'baskets'   => BasketModel::getBasketsByLogin(['login' => $user['user_id'], 'unneededBasketId' => ['IndexingBasket']])
        ]);
    }

    public function getStatusByUserId(Request $request, Response $response, array $aArgs)
    {
        if (!ServiceModel::hasService(['id' => 'admin_users', 'userId' => $GLOBALS['userId'], 'location' => 'apps', 'type' => 'admin'])) {
            return $response->withStatus(403)->withJson(['errors' => 'Service forbidden']);
        }
        
        $user = UserModel::getByLowerLogin(['login' => $aArgs['userId'], 'select' => ['status']]);

        if (empty($user)) {
            return $response->withJson(['status' => null]);
        }

        return $response->withJson(['status' => $user['status']]);
    }

    public function updateStatus(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $data = $request->getParams();

        $check = Validator::stringType()->notEmpty()->validate($data['status']);
        $check = $check && ($data['status'] == 'OK' || $data['status'] == 'ABS');
        if (!$check) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }

        UserModel::updateStatus(['id' => $aArgs['id'], 'status' => $data['status']]);

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id', 'firstname', 'lastname']]);
        HistoryController::add([
            'tableName'    => 'users',
            'recordId'     => $user['user_id'],
            'eventType'    => 'RET',
            'eventId'      => 'userabs',
            'info'         => "{$user['firstname']} {$user['lastname']} " ._BACK_FROM_VACATION
        ]);

        return $response->withJson(['user' => UserModel::getById(['id' => $aArgs['id'], 'select' => ['status']])]);
    }

    public function getImageContent(Request $request, Response $response, array $aArgs)
    {
        if (!Validator::intVal()->validate($aArgs['id']) || !Validator::intVal()->validate($aArgs['signatureId'])) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $signatures = UserSignatureModel::get([
            'select'    => ['signature_path', 'signature_file_name'],
            'where'     => ['user_serial_id = ?', 'id = ?'],
            'data'      => [$aArgs['id'], $aArgs['signatureId']]
        ]);
        if (empty($signatures[0])) {
            return $response->withStatus(400)->withJson(['errors' => 'Signature does not exist']);
        }

        $docserver = DocserverModel::getCurrentDocserver(['typeId' => 'TEMPLATES', 'collId' => 'templates', 'select' => ['path_template']]);
        if (empty($docserver['path_template']) || !file_exists($docserver['path_template'])) {
            return [];
        }

        $pathToSignature = $docserver['path_template'] . str_replace('#', '/', $signatures[0]['signature_path']) . $signatures[0]['signature_file_name'];
        $image = file_get_contents($pathToSignature);
        if ($image === false) {
            return $response->withStatus(404)->withJson(['errors' => 'Signature not found on docserver']);
        }

        $finfo    = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($image);

        $response->write($image);

        return $response->withHeader('Content-Type', $mimeType);
    }

    public function addSignature(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $data = $request->getParams();

        if (!$this->checkNeededParameters(['data' => $data, 'needed' => ['base64', 'name', 'label']])) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }

        $file     = base64_decode($data['base64']);
        $tmpName  = "tmp_file_{$aArgs['id']}_" .rand(). "_{$data['name']}";

        $finfo    = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->buffer($file);
        $size     = strlen($file);
        $type     = explode('/', $mimeType);
        $ext      = strtoupper(substr($data['name'], strrpos($data['name'], '.') + 1));

        $fileAccepted = false;

        $loadedXml = CoreConfigModel::getXmlLoaded(['path' => 'apps/maarch_entreprise/xml/extensions.xml']);
        if ($loadedXml && count($loadedXml->FORMAT) > 0) {
            foreach ($loadedXml->FORMAT as $value) {
                if (strtoupper($value->name) == $ext && strtoupper($value->mime) == strtoupper($mimeType)) {
                    $fileAccepted = true;
                    break;
                }
            }
        }

        if (!$fileAccepted || $type[0] != 'image') {
            return $response->withStatus(400)->withJson(['errors' => _WRONG_FILE_TYPE]);
        } elseif ($size > 2000000) {
            return $response->withStatus(400)->withJson(['errors' => _MAX_SIZE_UPLOAD_REACHED . ' (2 MB)']);
        }

        file_put_contents(CoreConfigModel::getTmpPath() . $tmpName, $file);

        $storeInfos = DocserverController::storeResourceOnDocServer([
            'collId'            => 'templates',
            'docserverTypeId'   => 'TEMPLATES',
            'encodedResource'   => base64_encode($file),
            'format'            => $ext
        ]);

        if (!file_exists($storeInfos['path_template']. str_replace('#', '/', $storeInfos['destination_dir']) .$storeInfos['file_destination_name'])) {
            return $response->withStatus(500)->withJson(['errors' => $storeInfos['error'] .' '. _PATH_OF_DOCSERVER_UNAPPROACHABLE]);
        }

        UserSignatureModel::create([
            'userSerialId'      => $aArgs['id'],
            'signatureLabel'    => $data['label'],
            'signaturePath'     => $storeInfos['destination_dir'],
            'signatureFileName' => $storeInfos['file_destination_name'],
        ]);

        return $response->withJson([
            'signatures' => UserSignatureModel::getByUserSerialId(['userSerialid' => $aArgs['id']])
        ]);
    }

    public function updateSignature(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $data = $request->getParams();

        if (!$this->checkNeededParameters(['data' => $data, 'needed' => ['label']])) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }

        UserSignatureModel::update([
            'signatureId'   => $aArgs['signatureId'],
            'userSerialId'  => $aArgs['id'],
            'label'         => $data['label']
        ]);

        return $response->withJson([
            'signature' => UserSignatureModel::getById(['id' => $aArgs['signatureId']])
        ]);
    }

    public function deleteSignature(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id'], 'himself' => true]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        UserSignatureModel::delete(['signatureId' => $aArgs['signatureId'], 'userSerialId' => $aArgs['id']]);

        return $response->withJson([
            'signatures' => UserSignatureModel::getByUserSerialId(['userSerialid' => $aArgs['id']])
        ]);
    }

    public function createCurrentUserEmailSignature(Request $request, Response $response)
    {
        $data = $request->getParams();

        if (!$this->checkNeededParameters(['data' => $data, 'needed' => ['title', 'htmlBody']])) {
            return $response->withJson(['errors' => 'Bad Request']);
        }

        UserModel::createEmailSignature([
            'userId'    => $GLOBALS['userId'],
            'title'     => $data['title'],
            'htmlBody'  => $data['htmlBody']
        ]);

        return $response->withJson([
            'emailSignatures' => UserModel::getEmailSignaturesById(['userId' => $GLOBALS['userId']])
        ]);
    }

    public function updateCurrentUserEmailSignature(Request $request, Response $response, array $aArgs)
    {
        $data = $request->getParams();

        if (!$this->checkNeededParameters(['data' => $data, 'needed' => ['title', 'htmlBody']])) {
            return $response->withJson(['errors' => 'Bad Request']);
        }

        UserModel::updateEmailSignature([
            'id'        => $aArgs['id'],
            'userId'    => $GLOBALS['userId'],
            'title'     => $data['title'],
            'htmlBody'  => $data['htmlBody']
        ]);

        return $response->withJson([
            'emailSignature' => UserModel::getEmailSignatureWithSignatureIdById(['userId' => $GLOBALS['userId'], 'signatureId' => $aArgs['id']])
        ]);
    }

    public function deleteCurrentUserEmailSignature(Request $request, Response $response, array $aArgs)
    {
        UserModel::deleteEmailSignature([
            'id'        => $aArgs['id'],
            'userId'    => $GLOBALS['userId']
        ]);

        return $response->withJson(['emailSignatures' => UserModel::getEmailSignaturesById(['userId' => $GLOBALS['userId']])]);
    }

    public function addGroup(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $data = $request->getParams();
        if (!$this->checkNeededParameters(['data' => $data, 'needed' => ['groupId']])) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }
        $group = GroupModel::getByGroupId(['select' => ['id'], 'groupId' => $data['groupId']]);
        if (empty($group)) {
            return $response->withStatus(400)->withJson(['errors' => 'Group not found']);
        } elseif (UserModel::hasGroup(['id' => $aArgs['id'], 'groupId' => $data['groupId']])) {
            return $response->withStatus(400)->withJson(['errors' => _USER_ALREADY_LINK_GROUP]);
        }
        if (empty($data['role'])) {
            $data['role'] = '';
        }

        UserModel::addGroup(['id' => $aArgs['id'], 'groupId' => $data['groupId'], 'role' => $data['role']]);

        $baskets = GroupBasketModel::get(['select' => ['basket_id'], 'where' => ['group_id = ?'], 'data' => [$data['groupId']]]);
        foreach ($baskets as $basket) {
            UserBasketPreferenceModel::create([
                'userSerialId'  => $aArgs['id'],
                'groupSerialId' => $group['id'],
                'basketId'      => $basket['basket_id'],
                'display'       => 'true'
            ]);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);
        HistoryController::add([
            'tableName' => 'users',
            'recordId'  => $user['user_id'],
            'eventType' => 'UP',
            'info'      => _USER_GROUP_CREATION . " : {$user['user_id']} {$data['groupId']}",
            'moduleId'  => 'user',
            'eventId'   => 'userModification',
        ]);

        return $response->withJson([
            'groups'    => UserModel::getGroupsByUserId(['userId' => $user['user_id']]),
            'baskets'   => BasketModel::getBasketsByLogin(['login' => $user['user_id'], 'unneededBasketId' => ['IndexingBasket']])
        ]);
    }

    public function updateGroup(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }
        if (empty(GroupModel::getByGroupId(['groupId' => $aArgs['groupId']]))) {
            return $response->withStatus(400)->withJson(['errors' => 'Group not found']);
        }

        $data = $request->getParams();
        if (empty($data['role'])) {
            $data['role'] = '';
        }

        UserModel::updateGroup(['id' => $aArgs['id'], 'groupId' => $aArgs['groupId'], 'role' => $data['role']]);

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);
        HistoryController::add([
            'tableName' => 'users',
            'recordId'  => $user['user_id'],
            'eventType' => 'UP',
            'info'      => _USER_GROUP_MODIFICATION . " : {$user['user_id']} {$aArgs['groupId']}",
            'moduleId'  => 'user',
            'eventId'   => 'userModification',
        ]);

        return $response->withJson(['success' => 'success']);
    }

    public function deleteGroup(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }
        $group = GroupModel::getByGroupId(['select' => ['id'], 'groupId' => $aArgs['groupId']]);
        if (empty($group)) {
            return $response->withStatus(400)->withJson(['errors' => 'Group not found']);
        }

        UserModel::deleteGroup(['id' => $aArgs['id'], 'groupId' => $aArgs['groupId']]);

        UserBasketPreferenceModel::delete([
            'where' => ['user_serial_id = ?', 'group_serial_id = ?'],
            'data'  => [$aArgs['id'], $group['id']]
        ]);
        RedirectBasketModel::delete([
            'where' => ['owner_user_id = ?', 'group_id = ?'],
            'data'  => [$aArgs['id'], $group['id']]
        ]);

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);
        HistoryController::add([
            'tableName' => 'users',
            'recordId'  => $user['user_id'],
            'eventType' => 'UP',
            'info'      => _USER_GROUP_SUPPRESSION . " : {$user['user_id']} {$aArgs['groupId']}",
            'moduleId'  => 'user',
            'eventId'   => 'userModification',
        ]);

        return $response->withJson([
            'groups'            => UserModel::getGroupsByUserId(['userId' => $user['user_id']]),
            'baskets'           => BasketModel::getBasketsByLogin(['login' => $user['user_id'], 'unneededBasketId' => ['IndexingBasket']]),
            'redirectedBaskets' => RedirectBasketModel::getRedirectedBasketsByUserId(['userId' => $aArgs['id']]),
        ]);
    }

    public function addEntity(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $data = $request->getParams();
        if (!$this->checkNeededParameters(['data' => $data, 'needed' => ['entityId']])) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }
        if (empty(entitymodel::getByEntityId(['entityId' => $data['entityId']]))) {
            return $response->withStatus(400)->withJson(['errors' => 'Entity not found']);
        } elseif (UserModel::hasEntity(['id' => $aArgs['id'], 'entityId' => $data['entityId']])) {
            return $response->withStatus(400)->withJson(['errors' => _USER_ALREADY_LINK_ENTITY]);
        }
        if (empty($data['role'])) {
            $data['role'] = '';
        }
        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);
        $primaryEntity = UserModel::getPrimaryEntityByUserId(['userId' => $user['user_id']]);
        $pEntity = 'N';
        if (empty($primaryEntity)) {
            $pEntity = 'Y';
        }

        UserEntityModel::addUserEntity(['id' => $aArgs['id'], 'entityId' => $data['entityId'], 'role' => $data['role'], 'primaryEntity' => $pEntity]);
        HistoryController::add([
            'tableName' => 'users',
            'recordId'  => $user['user_id'],
            'eventType' => 'UP',
            'info'      => _USER_ENTITY_CREATION . " : {$user['user_id']} {$data['entityId']}",
            'moduleId'  => 'user',
            'eventId'   => 'userModification',
        ]);

        return $response->withJson([
            'entities'      => UserModel::getEntitiesById(['userId' => $user['user_id']]),
            'allEntities'   => EntityModel::getAvailableEntitiesForAdministratorByUserId(['userId' => $user['user_id'], 'administratorUserId' => $GLOBALS['userId']])
        ]);
    }

    public function updateEntity(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }
        if (empty(entitymodel::getByEntityId(['entityId' => $aArgs['entityId']]))) {
            return $response->withStatus(400)->withJson(['errors' => 'Entity not found']);
        }

        $data = $request->getParams();
        if (empty($data['user_role'])) {
            $data['user_role'] = '';
        }

        UserEntityModel::updateUserEntity(['id' => $aArgs['id'], 'entityId' => $aArgs['entityId'], 'role' => $data['user_role']]);
        HistoryController::add([
            'tableName' => 'users',
            'recordId'  => $aArgs['id'],
            'eventType' => 'UP',
            'info'      => _USER_ENTITY_MODIFICATION . " : {$aArgs['id']} {$aArgs['entityId']}",
            'moduleId'  => 'user',
            'eventId'   => 'userModification',
        ]);

        return $response->withJson(['success' => 'success']);
    }

    public function updatePrimaryEntity(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }
        if (empty(entitymodel::getByEntityId(['entityId' => $aArgs['entityId']]))) {
            return $response->withStatus(400)->withJson(['errors' => 'Entity not found']);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);
        UserEntityModel::updateUserPrimaryEntity(['id' => $aArgs['id'], 'entityId' => $aArgs['entityId']]);

        return $response->withJson(['entities' => UserModel::getEntitiesById(['userId' => $user['user_id']])]);
    }

    public function deleteEntity(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }
        if (empty(entitymodel::getByEntityId(['entityId' => $aArgs['entityId']]))) {
            return $response->withStatus(400)->withJson(['errors' => 'Entity not found']);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);

        $data = $request->getParams();
        if (!empty($data['mode'])) {
            if ($data['mode'] == 'reaffect') {
                ListTemplateModel::update([
                    'set'   => ['item_id' => $data['newUser']],
                    'where' => ['object_id = ?', 'item_id = ?'],
                    'data'  => [$aArgs['entityId'], $user['user_id']]
                ]);
                $listInstances = ListInstanceModel::getWithConfidentiality(['select' => ['listinstance.res_id'], 'entityId' => $aArgs['entityId'], 'userId' => $user['user_id']]);
                $resIdsToReplace = [];
                foreach ($listInstances as $listInstance) {
                    $resIdsToReplace[] = $listInstance['res_id'];
                }
                if (!empty($resIdsToReplace)) {
                    ListInstanceModel::update([
                        'set'   => ['item_id' => $data['newUser']],
                        'where' => ['res_id in (?)', 'item_id = ?', 'process_date is null'],
                        'data'  => [$resIdsToReplace, $user['user_id']]
                    ]);
                }
            } else {
                ListTemplateModel::delete([
                    'where' => ['object_id = ?', 'item_id = ?', 'item_mode != ?'],
                    'data'  => [$aArgs['entityId'], $user['user_id'], 'dest']
                ]);

                $ressources = ResModel::getOnView([
                    'select'    => ['res_id'],
                    'where'     => ['confidentiality = ?', 'destination = ?', 'closing_date is null'],
                    'data'      => ['Y', $aArgs['entityId']]
                ]);
                foreach ($ressources as $ressource) {
                    $listInstanceId = ListInstanceModel::get([
                        'select'    => ['listinstance_id'],
                        'where'     => ['res_id = ?', 'item_id = ?', 'item_type = ?', 'difflist_type = ?', 'item_mode = ?', 'process_date is null'],
                        'data'      => [$ressource['res_id'], $user['user_id'], 'user_id', 'VISA_CIRCUIT', 'sign']
                    ]);

                    if (!empty($listInstanceId)) {
                        ListInstanceModel::update([
                            'set'   => ['process_date' => null],
                            'where' => ['res_id = ?', 'difflist_type = ?', 'listinstance_id = ?'],
                            'data'  => [$ressource['res_id'], 'VISA_CIRCUIT', $listInstanceId[0]['listinstance_id'] - 1]
                        ]);
                        $listInstanceMinus = ListInstanceModel::get([
                            'select'    => ['requested_signature'],
                            'where'     => ['listinstance_id = ?'],
                            'data'      => [$listInstanceId[0]['listinstance_id'] - 1]
                        ]);
                        if ($listInstanceMinus[0]['requested_signature']) {
                            ResModel::update(['set' => ['status' => 'ESIG'], 'where' => ['res_id = ?'], 'data' => [$ressource['res_id']]]);
                        } else {
                            ResModel::update(['set' => ['status' => 'EVIS'], 'where' => ['res_id = ?'], 'data' => [$ressource['res_id']]]);
                        }
                    }
                }

                $listInstances = ListInstanceModel::getWithConfidentiality(['select' => ['listinstance.res_id', 'listinstance.difflist_type'], 'entityId' => $aArgs['entityId'], 'userId' => $user['user_id']]);
                $resIdsToReplace = [];
                foreach ($listInstances as $listInstance) {
                    $resIdsToReplace[] = $listInstance['res_id'];
                }
                if (!empty($resIdsToReplace)) {
                    ListInstanceModel::update([
                        'set'   => ['process_comment' => '[DEL] supprimé - changement d\'entité', 'process_date' => 'CURRENT_TIMESTAMP'],
                        'where' => ['res_id in (?)', 'item_id = ?'],
                        'data'  => [$resIdsToReplace, $user['user_id']]
                    ]);
                }
            }
        }

        $primaryEntity = UserModel::getPrimaryEntityByUserId(['userId' => $user['user_id']]);
        UserEntityModel::deleteUserEntity(['id' => $aArgs['id'], 'entityId' => $aArgs['entityId']]);

        if (!empty($primaryEntity['entity_id']) && $primaryEntity['entity_id'] == $aArgs['entityId']) {
            UserEntityModel::reassignUserPrimaryEntity(['userId' => $user['user_id']]);
        }

        HistoryController::add([
            'tableName' => 'users',
            'recordId'  => $user['user_id'],
            'eventType' => 'UP',
            'info'      => _USER_ENTITY_SUPPRESSION . " : {$user['user_id']} {$aArgs['entityId']}",
            'moduleId'  => 'user',
            'eventId'   => 'userModification',
        ]);

        return $response->withJson([
            'entities'      => UserModel::getEntitiesById(['userId' => $user['user_id']]),
            'allEntities'   => EntityModel::getAvailableEntitiesForAdministratorByUserId(['userId' => $user['user_id'], 'administratorUserId' => $GLOBALS['userId']])
        ]);
    }

    public function isEntityDeletable(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }
        if (empty(entitymodel::getByEntityId(['entityId' => $aArgs['entityId']]))) {
            return $response->withStatus(400)->withJson(['errors' => 'Entity not found']);
        }

        $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);

        $listInstances = ListInstanceModel::getWithConfidentiality(['select' => [1], 'entityId' => $aArgs['entityId'], 'userId' => $user['user_id']]);

        $listTemplates = ListTemplateModel::get(['select' => [1], 'where' => ['object_id = ?', 'item_type = ?', 'item_id = ?'], 'data' => [$aArgs['entityId'], 'user_id', $user['user_id']]]);

        return $response->withJson(['hasConfidentialityInstances' => !empty($listInstances), 'hasListTemplates' => !empty($listTemplates)]);
    }

    public function updateBasketsDisplay(Request $request, Response $response, array $aArgs)
    {
        $error = $this->hasUsersRights(['id' => $aArgs['id']]);
        if (!empty($error['error'])) {
            return $response->withStatus($error['status'])->withJson(['errors' => $error['error']]);
        }

        $data = $request->getParams();
        $check = Validator::arrayType()->notEmpty()->validate($data['baskets']);
        if (!$check) {
            return $response->withStatus(400)->withJson(['errors' => 'Bad Request']);
        }

        foreach ($data['baskets'] as $basketContainer) {
            $check = Validator::stringType()->notEmpty()->validate($basketContainer['basketId']);
            $check = $check && Validator::intVal()->notEmpty()->validate($basketContainer['groupSerialId']);
            $check = $check && Validator::boolType()->validate($basketContainer['allowed']);
            if (!$check) {
                return $response->withStatus(400)->withJson(['errors' => 'Element is missing']);
            }
        }

        foreach ($data['baskets'] as $basketContainer) {
            $group = GroupModel::getById(['id' => $basketContainer['groupSerialId'], 'select' => ['group_id']]);
            $basket = BasketModel::getByBasketId(['basketId' => $basketContainer['basketId'], 'select' => [1]]);
            if (empty($group) || empty($basket)) {
                return $response->withStatus(400)->withJson(['errors' => 'Group or basket does not exist']);
            }

            $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);
            $groups = UserModel::getGroupsByUserId(['userId' => $user['user_id']]);
            $groupFound = false;
            foreach ($groups as $value) {
                if ($value['id'] == $basketContainer['groupSerialId']) {
                    $groupFound = true;
                }
            }
            if (!$groupFound) {
                return $response->withStatus(400)->withJson(['errors' => 'Group is not linked to this user']);
            }
            $groups = GroupBasketModel::get(['where' => ['basket_id = ?'], 'data' => [$basketContainer['basketId']]]);
            $groupFound = false;
            foreach ($groups as $value) {
                if ($value['group_id'] == $group['group_id']) {
                    $groupFound = true;
                }
            }
            if (!$groupFound) {
                return $response->withStatus(400)->withJson(['errors' => 'Group is not linked to this basket']);
            }

            if ($basketContainer['allowed']) {
                $preference = UserBasketPreferenceModel::get([
                    'select'    => [1],
                    'where'     => ['user_serial_id = ?', 'group_serial_id = ?', 'basket_id = ?'],
                    'data'      => [$aArgs['id'], $basketContainer['groupSerialId'], $basketContainer['basketId']]
                ]);
                if (!empty($preference)) {
                    return $response->withStatus(400)->withJson(['errors' => 'Preference already exists']);
                }
                $basketContainer['userSerialId'] = $aArgs['id'];
                $basketContainer['display'] = 'true';
                UserBasketPreferenceModel::create($basketContainer);
            } else {
                UserBasketPreferenceModel::delete([
                    'where' => ['user_serial_id = ?', 'group_serial_id = ?', 'basket_id = ?'],
                    'data'  => [$aArgs['id'], $basketContainer['groupSerialId'], $basketContainer['basketId']]
                ]);
            }
        }

        return $response->withJson(['success' => 'success']);
    }

    public function updateCurrentUserBasketPreferences(Request $request, Response $response, array $aArgs)
    {
        $data = $request->getParams();

        $user = UserModel::getByLogin(['login' => $GLOBALS['userId'], 'select' => ['id']]);

        if (isset($data['color']) && $data['color'] == '') {
            UserBasketPreferenceModel::update([
                'set'   => ['color' => null],
                'where' => ['user_serial_id = ?', 'group_serial_id = ?', 'basket_id = ?'],
                'data'  => [$user['id'], $aArgs['groupId'], $aArgs['basketId']]
            ]);
        } elseif (!empty($data['color'])) {
            UserBasketPreferenceModel::update([
                'set'   => ['color' => $data['color']],
                'where' => ['user_serial_id = ?', 'group_serial_id = ?', 'basket_id = ?'],
                'data'  => [$user['id'], $aArgs['groupId'], $aArgs['basketId']]
            ]);
        }

        return $response->withJson([
            'userBaskets' => BasketModel::getRegroupedBasketsByUserId(['userId' => $GLOBALS['userId']])
        ]);
    }

    public function hasUsersRights(array $aArgs)
    {
        $error = [
            'status'    => 200,
            'error'     => ''
        ];

        if (!is_numeric($aArgs['id'])) {
            $error['status'] = 400;
            $error['error'] = 'id must be an integer';
        } else {
            $user = UserModel::getById(['id' => $aArgs['id'], 'select' => ['user_id']]);
            if (empty($user['user_id'])) {
                $error['status'] = 400;
                $error['error'] = 'User not found';
            } else {
                if (empty($aArgs['himself']) || $GLOBALS['userId'] != $user['user_id']) {
                    if (!ServiceModel::hasService(['id' => 'admin_users', 'userId' => $GLOBALS['userId'], 'location' => 'apps', 'type' => 'admin'])) {
                        $error['status'] = 403;
                        $error['error'] = 'Service forbidden';
                    }
                    if ($GLOBALS['userId'] != 'superadmin') {
                        $entities = EntityModel::getAllEntitiesByUserId(['userId' => $GLOBALS['userId']]);
                        $users = UserEntityModel::getWithUsers([
                            'select'    => ['users.id'],
                            'where'     => ['users_entities.entity_id in (?)', 'status != ?'],
                            'data'      => [$entities, 'DEL']
                        ]);
                        $usersNoEntities = UserEntityModel::getUsersWithoutEntities(['select' => ['id']]);
                        $users = array_merge($users, $usersNoEntities);
                        $allowed = false;
                        foreach ($users as $value) {
                            if ($value['id'] == $aArgs['id']) {
                                $allowed = true;
                            }
                        }
                        if (!$allowed) {
                            $error['status'] = 403;
                            $error['error'] = 'UserId out of perimeter';
                        }
                    }
                } elseif ($aArgs['delete'] && $GLOBALS['userId'] == $user['user_id']) {
                    $error['status'] = 403;
                    $error['error'] = 'Can not delete yourself';
                }
            }
        }


        return $error;
    }

    private function checkNeededParameters(array $aArgs)
    {
        foreach ($aArgs['needed'] as $value) {
            if (empty($aArgs['data'][$value])) {
                return false;
            }
        }

        return true;
    }
}
