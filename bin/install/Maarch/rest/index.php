<?php

/**
* Copyright Maarch since 2008 under licence GPLv3.
* See LICENCE.txt file at the root folder for more details.
* This file is part of Maarch software.
*
*/

/**
* @brief Rest Routes File
* @author dev@maarch.org
*/

require '../vendor/autoload.php';

//Root application position
chdir('..');
date_default_timezone_set(\SrcCore\models\CoreConfigModel::getTimezone());

$customId = \SrcCore\models\CoreConfigModel::getCustomId();
$language = \SrcCore\models\CoreConfigModel::getLanguage();
if (file_exists("custom/{$customId}/src/core/lang/lang-{$language}.php")) {
    require_once("custom/{$customId}/src/core/lang/lang-{$language}.php");
}
require_once("src/core/lang/lang-{$language}.php");


$app = new \Slim\App(['settings' => ['displayErrorDetails' => true, 'determineRouteBeforeAppMiddleware' => true]]);

//Authentication
$app->add(function (\Slim\Http\Request $request, \Slim\Http\Response $response, callable $next) {
    $routesWithoutAuthentication = ['GET/jnlp/{jnlpUniqueId}'];
    $route = $request->getAttribute('route');
    $currentMethod = empty($route) ? '' : $route->getMethods()[0];
    $currentRoute = empty($route) ? '' : $route->getPattern();

    if (!in_array($currentMethod.$currentRoute, $routesWithoutAuthentication)) {
        $userId = \SrcCore\controllers\AuthenticationController::authentication();
        if (!empty($userId)) {
            $GLOBALS['userId'] = $userId;
            if (!empty($currentRoute)) {
                $r = \SrcCore\controllers\AuthenticationController::isRouteAvailable(['userId' => $userId, 'currentRoute' => $currentRoute]);
                if (!$r['isRouteAvailable']) {
                    return $response->withStatus(405)->withJson(['errors' => $r['errors']]);
                }
            }
        } else {
            return $response->withStatus(401)->withJson(['errors' => 'Authentication Failed']);
        }
    }
    $response = $next($request, $response);
    return $response;
});

//Initialize
$app->get('/initialize', \SrcCore\controllers\CoreController::class . ':initialize');

//Actions
$app->get('/actions', \Action\controllers\ActionController::class . ':get');
$app->get('/initAction', \Action\controllers\ActionController::class . ':initAction');
$app->get('/actions/{id}', \Action\controllers\ActionController::class . ':getById');
$app->post('/actions', \Action\controllers\ActionController::class . ':create');
$app->put('/actions/{id}', \Action\controllers\ActionController::class . ':update');
$app->delete('/actions/{id}', \Action\controllers\ActionController::class . ':delete');

//Administration
$app->get('/administration', \SrcCore\controllers\CoreController::class . ':getAdministration');

//AutoComplete
$app->get('/autocomplete/contacts', \SrcCore\controllers\AutoCompleteController::class . ':getContacts');
$app->get('/autocomplete/users', \SrcCore\controllers\AutoCompleteController::class . ':getUsers');
$app->get('/autocomplete/contactsUsers', \SrcCore\controllers\AutoCompleteController::class . ':getContactsAndUsers');
$app->get('/autocomplete/contacts/groups', \SrcCore\controllers\AutoCompleteController::class . ':getContactsForGroups');
$app->get('/autocomplete/users/administration', \SrcCore\controllers\AutoCompleteController::class . ':getUsersForAdministration');
$app->get('/autocomplete/users/visa', \SrcCore\controllers\AutoCompleteController::class . ':getUsersForVisa');
$app->get('/autocomplete/entities', \SrcCore\controllers\AutoCompleteController::class . ':getEntities');
$app->get('/autocomplete/statuses', \SrcCore\controllers\AutoCompleteController::class . ':getStatuses');
$app->get('/autocomplete/banAddresses', \SrcCore\controllers\AutoCompleteController::class . ':getBanAddresses');

//Baskets
$app->get('/baskets', \Basket\controllers\BasketController::class . ':get');
$app->post('/baskets', \Basket\controllers\BasketController::class . ':create');
$app->get('/baskets/{id}', \Basket\controllers\BasketController::class . ':getById');
$app->put('/baskets/{id}', \Basket\controllers\BasketController::class . ':update');
$app->delete('/baskets/{id}', \Basket\controllers\BasketController::class . ':delete');
$app->get('/baskets/{id}/groups', \Basket\controllers\BasketController::class . ':getGroups');
$app->post('/baskets/{id}/groups', \Basket\controllers\BasketController::class . ':createGroup');
$app->put('/baskets/{id}/groups/{groupId}', \Basket\controllers\BasketController::class . ':updateGroup');
$app->delete('/baskets/{id}/groups/{groupId}', \Basket\controllers\BasketController::class . ':deleteGroup');
$app->get('/baskets/{id}/groups/data', \Basket\controllers\BasketController::class . ':getDataForGroupById');
$app->get('/sortedBaskets', \Basket\controllers\BasketController::class . ':getSorted');
$app->put('/sortedBaskets/{id}', \Basket\controllers\BasketController::class . ':updateSort');

//BatchHistories
$app->get('/batchHistories', \History\controllers\BatchHistoryController::class . ':get');

//Contacts
$app->post('/contacts', \Contact\controllers\ContactController::class . ':create');
$app->put('/contacts/{id}', \Contact\controllers\ContactController::class . ':update');
$app->post('/contacts/{id}/addresses', \Contact\controllers\ContactController::class . ':createAddress');
$app->put('/contacts/{id}/addresses/{addressId}', \Contact\controllers\ContactController::class . ':updateAddress');
$app->get('/contacts/{contactId}/communication', \Contact\controllers\ContactController::class . ':getCommunicationByContactId');
$app->get('/contactsGroups', \Contact\controllers\ContactGroupController::class . ':get');
$app->post('/contactsGroups', \Contact\controllers\ContactGroupController::class . ':create');
$app->get('/contactsGroups/{id}', \Contact\controllers\ContactGroupController::class . ':getById');
$app->put('/contactsGroups/{id}', \Contact\controllers\ContactGroupController::class . ':update');
$app->delete('/contactsGroups/{id}', \Contact\controllers\ContactGroupController::class . ':delete');
$app->post('/contactsGroups/{id}/contacts', \Contact\controllers\ContactGroupController::class . ':addContacts');
$app->delete('/contactsGroups/{id}/contacts/{addressId}', \Contact\controllers\ContactGroupController::class . ':deleteContact');
$app->get('/contactsTypes', \Contact\controllers\ContactTypeController::class . ':get');
$app->get('/contactsFilling', \Contact\controllers\ContactController::class . ':getFilling');
$app->put('/contactsFilling', \Contact\controllers\ContactController::class . ':updateFilling');

//Docservers
$app->get('/docservers', \Docserver\controllers\DocserverController::class . ':get');
$app->post('/docservers', \Docserver\controllers\DocserverController::class . ':create');
$app->get('/docservers/{id}', \Docserver\controllers\DocserverController::class . ':getById');
$app->put('/docservers/{id}', \Docserver\controllers\DocserverController::class . ':update');
$app->delete('/docservers/{id}', \Docserver\controllers\DocserverController::class . ':delete');

//DocserverTypes
$app->get('/docserverTypes', \Docserver\controllers\DocserverTypeController::class . ':get');
$app->get('/docserverTypes/{id}', \Docserver\controllers\DocserverTypeController::class . ':getById');

//doctypes
$app->get('/doctypes', \Doctype\controllers\FirstLevelController::class . ':getTree');
$app->post('/doctypes/firstLevel', \Doctype\controllers\FirstLevelController::class . ':create');
$app->get('/doctypes/firstLevel/{id}', \Doctype\controllers\FirstLevelController::class . ':getById');
$app->put('/doctypes/firstLevel/{id}', \Doctype\controllers\FirstLevelController::class . ':update');
$app->delete('/doctypes/firstLevel/{id}', \Doctype\controllers\FirstLevelController::class . ':delete');
$app->post('/doctypes/secondLevel', \Doctype\controllers\SecondLevelController::class . ':create');
$app->get('/doctypes/secondLevel/{id}', \Doctype\controllers\SecondLevelController::class . ':getById');
$app->put('/doctypes/secondLevel/{id}', \Doctype\controllers\SecondLevelController::class . ':update');
$app->delete('/doctypes/secondLevel/{id}', \Doctype\controllers\SecondLevelController::class . ':delete');
$app->get('/doctypes/types', \Doctype\controllers\DoctypeController::class . ':get');
$app->post('/doctypes/types', \Doctype\controllers\DoctypeController::class . ':create');
$app->get('/doctypes/types/{id}', \Doctype\controllers\DoctypeController::class . ':getById');
$app->put('/doctypes/types/{id}', \Doctype\controllers\DoctypeController::class . ':update');
$app->delete('/doctypes/types/{id}', \Doctype\controllers\DoctypeController::class . ':delete');
$app->put('/doctypes/types/{id}/redirect', \Doctype\controllers\DoctypeController::class . ':deleteRedirect');
$app->get('/administration/doctypes/new', \Doctype\controllers\FirstLevelController::class . ':initDoctypes');

//Entities
$app->get('/entities', \Entity\controllers\EntityController::class . ':get');
$app->post('/entities', \Entity\controllers\EntityController::class . ':create');
$app->get('/entities/{id}', \Entity\controllers\EntityController::class . ':getById');
$app->put('/entities/{id}', \Entity\controllers\EntityController::class . ':update');
$app->delete('/entities/{id}', \Entity\controllers\EntityController::class . ':delete');
$app->get('/entities/{id}/details', \Entity\controllers\EntityController::class . ':getDetailledById');
$app->put('/entities/{id}/reassign/{newEntityId}', \Entity\controllers\EntityController::class . ':reassignEntity');
$app->put('/entities/{id}/status', \Entity\controllers\EntityController::class . ':updateStatus');
$app->get('/entityTypes', \Entity\controllers\EntityController::class . ':getTypes');

//Groups
$app->get('/groups', \Group\controllers\GroupController::class . ':get');
$app->post('/groups', \Group\controllers\GroupController::class . ':create');
$app->get('/groups/{id}', \Group\controllers\GroupController::class . ':getById');
$app->put('/groups/{id}', \Group\controllers\GroupController::class . ':update');
$app->delete('/groups/{id}', \Group\controllers\GroupController::class . ':delete');
$app->get('/groups/{id}/details', \Group\controllers\GroupController::class . ':getDetailledById');
$app->put('/groups/{id}/services/{serviceId}', \Group\controllers\GroupController::class . ':updateService');
$app->put('/groups/{id}/reassign/{newGroupId}', \Group\controllers\GroupController::class . ':reassignUsers');

//Histories
$app->get('/histories', \History\controllers\HistoryController::class . ':get');
$app->get('/histories/users/{userSerialId}', \History\controllers\HistoryController::class . ':getByUserId');

//Header
$app->get('/header', \SrcCore\controllers\CoreController::class . ':getHeader');

//Home
$app->get('/home', \Home\controllers\HomeController::class . ':get');
$app->get('/home/lastRessources', \Home\controllers\HomeController::class . ':getLastRessources');

//Jnlp
$app->post('/jnlp', \ContentManagement\controllers\JnlpController::class . ':generateJnlp');
$app->get('/jnlp/{jnlpUniqueId}', \ContentManagement\controllers\JnlpController::class . ':renderJnlp');
$app->post('/jnlp/{jnlpUniqueId}', \ContentManagement\controllers\JnlpController::class . ':processJnlp');
$app->get('/jnlp/lock/{jnlpUniqueId}', \ContentManagement\controllers\JnlpController::class . ':isLockFileExisting');

//Links
$app->get('/links/resId/{resId}', \Link\controllers\LinkController::class . ':getByResId');

//Listinstance
$app->get('/listinstance/{id}', \Entity\controllers\ListInstanceController::class . ':getById');
$app->get('/res/{resId}/listinstance', \Entity\controllers\ListInstanceController::class . ':getListByResId');
$app->get('/res/{resId}/visaCircuit', \Entity\controllers\ListInstanceController::class . ':getVisaCircuitByResId');
$app->get('/res/{resId}/avisCircuit', \Entity\controllers\ListInstanceController::class . ':getAvisCircuitByResId');
$app->put('/listinstances', \Entity\controllers\ListInstanceController::class . ':update');

//ListTemplates
$app->get('/listTemplates', \Entity\controllers\ListTemplateController::class . ':get');
$app->post('/listTemplates', \Entity\controllers\ListTemplateController::class . ':create');
$app->get('/listTemplates/{id}', \Entity\controllers\ListTemplateController::class . ':getById');
$app->put('/listTemplates/{id}', \Entity\controllers\ListTemplateController::class . ':update');
$app->delete('/listTemplates/{id}', \Entity\controllers\ListTemplateController::class . ':delete');
$app->put('/listTemplates/entityDest/itemId/{itemId}', \Entity\controllers\ListTemplateController::class . ':updateByUserWithEntityDest');
$app->get('/listTemplates/types/{typeId}/roles', \Entity\controllers\ListTemplateController::class . ':getTypeRoles');
$app->put('/listTemplates/types/{typeId}/roles', \Entity\controllers\ListTemplateController::class . ':updateTypeRoles');

//Notes
$app->get('/res/{resId}/notes', \Note\controllers\NoteController::class . ':getByResId');

//Parameters
$app->get('/parameters', \Parameter\controllers\ParameterController::class . ':get');
$app->post('/parameters', \Parameter\controllers\ParameterController::class . ':create');
$app->get('/parameters/{id}', \Parameter\controllers\ParameterController::class . ':getById');
$app->put('/parameters/{id}', \Parameter\controllers\ParameterController::class . ':update');
$app->delete('/parameters/{id}', \Parameter\controllers\ParameterController::class . ':delete');

//PasswordRules
$app->get('/passwordRules', \SrcCore\controllers\PasswordController::class . ':getRules');
$app->put('/passwordRules', \SrcCore\controllers\PasswordController::class . ':updateRules');

//Priorities
$app->get('/priorities', \Priority\controllers\PriorityController::class . ':get');
$app->post('/priorities', \Priority\controllers\PriorityController::class . ':create');
$app->get('/priorities/{id}', \Priority\controllers\PriorityController::class . ':getById');
$app->put('/priorities/{id}', \Priority\controllers\PriorityController::class . ':update');
$app->delete('/priorities/{id}', \Priority\controllers\PriorityController::class . ':delete');
$app->get('/sortedPriorities', \Priority\controllers\PriorityController::class . ':getSorted');
$app->put('/sortedPriorities', \Priority\controllers\PriorityController::class . ':updateSort');

//Reports
$app->get('/reports/groups', \Report\controllers\ReportController::class . ':getGroups');
$app->get('/reports/groups/{groupId}', \Report\controllers\ReportController::class . ':getByGroupId');
$app->put('/reports/groups/{groupId}', \Report\controllers\ReportController::class . ':updateForGroupId');

//Resources
$app->post('/resources', \Resource\controllers\ResController::class . ':create');
$app->post('/res', \Resource\controllers\ResController::class . ':createRes');
$app->post('/resExt', \Resource\controllers\ResController::class . ':createExt');
$app->get('/res/{resId}/content', \Resource\controllers\ResController::class . ':getFileContent');
$app->get('/res/{resId}/originalContent', \Resource\controllers\ResController::class . ':getOriginalFileContent');
$app->get('/res/{resId}/thumbnail', \Resource\controllers\ResController::class . ':getThumbnailContent');
$app->put('/res/resource/status', \Resource\controllers\ResController::class . ':updateStatus');
$app->post('/res/list', \Resource\controllers\ResController::class . ':getList');
$app->get('/res/{resId}/lock', \Resource\controllers\ResController::class . ':isLock');
$app->get('/res/{resId}/notes/count', \Resource\controllers\ResController::class . ':getNotesCountForCurrentUserById');
$app->put('/res/externalInfos', \Resource\controllers\ResController::class . ':updateExternalInfos');
$app->get('/categories', \Resource\controllers\ResController::class . ':getCategories');
$app->get('/natures', \Resource\controllers\ResController::class . ':getNatures');
$app->get('/resources/groups/{groupSerialId}/baskets/{basketId}', \Resource\controllers\ResController::class . ':getResourcesByBasket');
$app->get('/resources/{resId}/isAllowed', \Resource\controllers\ResController::class . ':isAllowedForCurrentUser');


//Attachments
$app->post('/attachments', \Attachment\controllers\AttachmentController::class . ':create');
$app->get('/res/{resId}/attachments', \Attachment\controllers\AttachmentController::class . ':getAttachmentsListById');
$app->get('/res/{resIdMaster}/attachments/{resId}/content', \Attachment\controllers\AttachmentController::class . ':getFileContent');
$app->get('/res/{resIdMaster}/attachments/{resId}/thumbnail', \Attachment\controllers\AttachmentController::class . ':getThumbnailContent');

//SignatureBook
$app->get('/{basketId}/signatureBook/resList', \SignatureBook\controllers\SignatureBookController::class . ':getResList');
$app->get('/{basketId}/signatureBook/resList/details', \SignatureBook\controllers\SignatureBookController::class . ':getDetailledResList');
$app->get('/groups/{groupId}/baskets/{basketId}/signatureBook/{resId}', \SignatureBook\controllers\SignatureBookController::class . ':getSignatureBook');
$app->get('/signatureBook/{resId}/attachments', \SignatureBook\controllers\SignatureBookController::class . ':getAttachmentsById');
$app->get('/signatureBook/{resId}/incomingMailAttachments', \SignatureBook\controllers\SignatureBookController::class . ':getIncomingMailAndAttachmentsById');
$app->put('/signatureBook/{resId}/unsign', \SignatureBook\controllers\SignatureBookController::class . ':unsignFile');
$app->put('/attachments/{id}/inSignatureBook', \Attachment\controllers\AttachmentController::class . ':setInSignatureBook');

//statuses
$app->get('/statuses', \Status\controllers\StatusController::class . ':get');
$app->post('/statuses', \Status\controllers\StatusController::class . ':create');
$app->get('/statuses/{identifier}', \Status\controllers\StatusController::class . ':getByIdentifier');
$app->get('/status/{id}', \Status\controllers\StatusController::class . ':getById');
$app->put('/statuses/{identifier}', \Status\controllers\StatusController::class . ':update');
$app->delete('/statuses/{identifier}', \Status\controllers\StatusController::class . ':delete');
$app->get('/administration/statuses/new', \Status\controllers\StatusController::class . ':getNewInformations');

//Templates
$app->get('/templates', \Template\controllers\TemplateController::class . ':get');
$app->post('/templates', \Template\controllers\TemplateController::class . ':create');
$app->get('/templates/{id}/details', \Template\controllers\TemplateController::class . ':getDetailledById');
$app->put('/templates/{id}', \Template\controllers\TemplateController::class . ':update');
$app->delete('/templates/{id}', \Template\controllers\TemplateController::class . ':delete');
$app->post('/templates/{id}/duplicate', \Template\controllers\TemplateController::class . ':duplicate');
$app->get('/administration/templates/new', \Template\controllers\TemplateController::class . ':initTemplates');

//Users
$app->get('/users', \User\controllers\UserController::class . ':get');
$app->post('/users', \User\controllers\UserController::class . ':create');
$app->put('/users/{id}', \User\controllers\UserController::class . ':update');
$app->delete('/users/{id}', \User\controllers\UserController::class . ':delete');
$app->put('/users/{id}/suspend', \User\controllers\UserController::class . ':suspend');
$app->get('/users/{id}/isDeletable', \User\controllers\UserController::class . ':isDeletable');
$app->get('/users/{id}/details', \User\controllers\UserController::class . ':getDetailledById');
$app->put('/users/{id}/password', \User\controllers\UserController::class . ':resetPassword');
$app->put('/users/{id}/modifyPassword', \User\controllers\UserController::class . ':updatePassword');
$app->get('/users/{userId}/status', \User\controllers\UserController::class . ':getStatusByUserId');
$app->put('/users/{id}/status', \User\controllers\UserController::class . ':updateStatus');
$app->post('/users/{id}/groups', \User\controllers\UserController::class . ':addGroup');
$app->put('/users/{id}/groups/{groupId}', \User\controllers\UserController::class . ':updateGroup');
$app->delete('/users/{id}/groups/{groupId}', \User\controllers\UserController::class . ':deleteGroup');
$app->post('/users/{id}/entities', \User\controllers\UserController::class . ':addEntity');
$app->put('/users/{id}/entities/{entityId}', \User\controllers\UserController::class . ':updateEntity');
$app->put('/users/{id}/entities/{entityId}/primaryEntity', \User\controllers\UserController::class . ':updatePrimaryEntity');
$app->get('/users/{id}/entities/{entityId}', \User\controllers\UserController::class . ':isEntityDeletable');
$app->delete('/users/{id}/entities/{entityId}', \User\controllers\UserController::class . ':deleteEntity');
$app->post('/users/{id}/signatures', \User\controllers\UserController::class . ':addSignature');
$app->get('/users/{id}/signatures/{signatureId}/content', \User\controllers\UserController::class . ':getImageContent');
$app->put('/users/{id}/signatures/{signatureId}', \User\controllers\UserController::class . ':updateSignature');
$app->delete('/users/{id}/signatures/{signatureId}', \User\controllers\UserController::class . ':deleteSignature');
$app->post('/users/{id}/redirectedBaskets', \User\controllers\UserController::class . ':setRedirectedBaskets');
$app->delete('/users/{id}/redirectedBaskets/{basketId}', \User\controllers\UserController::class . ':deleteRedirectedBaskets');
$app->put('/users/{id}/baskets', \User\controllers\UserController::class . ':updateBasketsDisplay');

//VersionsUpdate
$app->get('/versionsUpdate', \VersionUpdate\controllers\VersionUpdateController::class . ':get');

//CurrentUser
$app->get('/currentUser/profile', \User\controllers\UserController::class . ':getProfile');
$app->put('/currentUser/profile', \User\controllers\UserController::class . ':updateProfile');
$app->put('/currentUser/password', \User\controllers\UserController::class . ':updateCurrentUserPassword');
$app->post('/currentUser/emailSignature', \User\controllers\UserController::class . ':createCurrentUserEmailSignature');
$app->put('/currentUser/emailSignature/{id}', \User\controllers\UserController::class . ':updateCurrentUserEmailSignature');
$app->delete('/currentUser/emailSignature/{id}', \User\controllers\UserController::class . ':deleteCurrentUserEmailSignature');
$app->put('/currentUser/groups/{groupId}/baskets/{basketId}', \User\controllers\UserController::class . ':updateCurrentUserBasketPreferences');

//Notifications
$app->get('/notifications', \Notification\controllers\NotificationController::class . ':get');
$app->post('/notifications', \Notification\controllers\NotificationController::class . ':create');
$app->get('/notifications/schedule', \Notification\controllers\NotificationScheduleController::class . ':get');
$app->post('/notifications/schedule', \Notification\controllers\NotificationScheduleController::class . ':create');
$app->put('/notifications/{id}', \Notification\controllers\NotificationController::class . ':update');
$app->delete('/notifications/{id}', \Notification\controllers\NotificationController::class . ':delete');
$app->get('/administration/notifications/new', \Notification\controllers\NotificationController::class . ':initNotification');
$app->get('/notifications/{id}', \Notification\controllers\NotificationController::class . ':getBySid');
$app->post('/scriptNotification', \Notification\controllers\NotificationScheduleController::class . ':createScriptNotification');

$app->post('/saveNumericPackage', \Sendmail\Controllers\ReceiveMessageExchangeController::class . ':saveMessageExchange');
$app->post('/saveMessageExchangeReturn', \Sendmail\Controllers\ReceiveMessageExchangeController::class . ':saveMessageExchangeReturn');
$app->post('/saveMessageExchangeReview', \Sendmail\Controllers\MessageExchangeReviewController::class . ':saveMessageExchangeReview');

// NCH01
$app->get('/getContactByVAT', \Contact\controllers\ContactController::class . ':getByVAT');
$app->get('/getUsers', \User\controllers\UserController::class . ':getByGroup');
// END NCH01

$app->run();
