/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan CHEVAL <nathan.cheval@edissyum.com> */

import { z } from "zod";

const imapSchema = z.object({
    securedConnection: z.boolean(),
    authMethod: z.literal("imap"),
    port: z.coerce.number().min(1).max(65535),
    login: z.string().min(1),
    hostname: z.string().min(1),
    password: z.string().min(1)
});

const oauthSchema = z.object({
    authMethod: z.literal("oauth"),
    clientId: z.string().min(1),
    clientSecret: z.string().min(1),
    redirectUri: z.url()
});

const graphqlSchema = z.object({
    authMethod: z.literal("graphql"),
    login: z.string().min(1),
    grant_type: z.string().default('client_credentials'),
    scope: z.url().default('https://graph.microsoft.com/.default'),
    users_url: z.url().default('https://graph.microsoft.com/v1.0/users'),
    message_url: z.url().default('https://graph.microsoft.com/v1.0/me/messages'),
    get_token_url: z.url().default('https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token'),
    client_id: z.string().min(1),
    tenant_id: z.string().min(1),
    client_secret: z.string().min(1)
});

export const getSchemaForAuthMethod = (authMethod: string) => {
    switch (authMethod) {
        case "imap":
            return imapSchema;
        case "oauth":
            return oauthSchema;
        case "graphql":
            return graphqlSchema;
        default:
            return imapSchema;
    }
};
