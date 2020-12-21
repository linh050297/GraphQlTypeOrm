
import { UsernameAndPasswordInput } from './../../utils/type-graphql';
import { errorsReturn } from './../../types';
import { returnErrorResponse } from "../../resolvers/responses";
import { validateEmail } from "../checkInputWithRegex";


export const validateRegister = (options: UsernameAndPasswordInput): errorsReturn | null=>{
    if(options.username.length < 2){
        return returnErrorResponse('username', "Username is not valid");
    }
    if(options.password.length < 5){
        return returnErrorResponse('password', "Password is not valid");
    }
    if(options.email){
       let checkEmail = validateEmail(options.email);
       if(checkEmail == false){
            return returnErrorResponse('email', 'Email is not valid');
       }
    };

    return null
}