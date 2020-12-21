
import { errorsReturn } from "src/types";

export const returnErrorResponse = ( field: string, message: string ): errorsReturn =>{
    return {
        errors:[{
            field,
            message
        }]
    }
}