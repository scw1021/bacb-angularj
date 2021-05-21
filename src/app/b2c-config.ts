
import {environment} from "../environments/environment"
/**
 * Enter here the user flows and custom policies for your B2C application,
 * To learn more about user flows, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
export const b2cPolicies = {
    names: {
        signUpSignIn: "B2C_1A_signup_signin",
        forgotPassword: "B2C_1A_PasswordReset",
        editProfile: "b2c_1_edit_profile"
    },
    authorities: {
        signUpSignIn: {
            authority: "https://BACBOauth.b2clogin.com/BACBOauth.onmicrosoft.com/B2C_1A_signup_signin",
        },
        forgotPassword: {
            authority: "https://BACBOauth.b2clogin.com/BACBOauth.onmicrosoft.com/B2C_1A_PasswordReset",
        },
        editProfile: {
            authority: "https://BACBOauth.b2clogin.com/BACBOauth.onmicrosoft.com/b2c_1_edit_profile"
        }
        // If we need to add some other kind of flow in the future, add them here 

    },
    authorityDomain: "BACBOauth.b2clogin.com"
}

/**
 * Enter here the coordinates of your Web API and scopes for access token request
 * The current application coordinates were pre-registered in a B2C tenant.
 */

 // change type to Map<string, Array<string>>();
 // Jsut pass in the exact type here
export const apiConfig: {scopes: string[]; uri: string} = {
    scopes: [
        "c3df2106-1e6e-4ede-b395-d741d37eddf3"
    ],
    uri: environment.adb2cUriConfig
//    uri: 'https://bacbportalapi-dev.azurewebsites.net'

};

