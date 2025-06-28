# Solar News App API Documentation

Welcome to the Solar News App API documentation! Below, you'll find information on the available endpoints and their functionalities.

## Endpoints

### 1. `admin/sendOTPforEmail` [POST]

- **Description:** Sends an OTP for email verification for SignUp.
- **Request Body:**  `` { Email, Password } ``
- **Response:** Sends an OTP to the provided email address.
- ***Note:***  ***Sends an Authenticate Email, Not Randomly Email***
### 2. `admin/SignUp` [POST]

- **Description:** Signs up a new admin with OTP(Which has Sent On SignUp Email).
- **Request Body:** `` {
        "OTP":"788"
} ``


- **Response:** `` {"message": "User Registered!!", token: token} ``

### 3. `admin/login` [POST]

- **Description:** Here You need to Provide Email and Password.
- **Request Body:** `` { Email, Password } ``
- **Response:** `` { message: "login Successfull!!", token: token } ``

... (continue with the rest of the endpoints)

### 4. `admin/otpforResetPassword` [PUT]
- **Description:** Here Your Need to Provide Existing Email and New Password
- **Request Body:** `` { Email:"Your Existence Email", Password:"New Password" } ``
- **Response :** This Request will send OTP on Existence Email To Reset Password. 

### 5. `admin/resetPassword` [PUT]
- **Descrption :** Here You Need to Send OTP, Which has Sent On Email To Reset Password.
- **Request Body :** `{ OTP : Your OTP }` 
- **Response :** `` { "message": "Details Updated" } ``

### 6. `admin/news` [GET]
- **Description :** This Endpoint Will Send You Entire News.
- **Request Body :** `` Nothing has to send in request body, just Get News ``
- **Response :** ``` [{
"uuid": "xyz",
"ImageURL": "https://private-gautam-bucket.s3.ap-south-1.amazonaws.com/xyz",
"title": "title",
"Description": "zsdfsdsdf",
"Date": "Date & Time",
"header": "Header"
},...] ```

### 7. `admin/createNews`[POST]
- **Description :** This Endpoint Will make News.
- **Request Body :** ```[{
            title: title,
            Description: Description,
            Date: date,
            ImageURL: data.Location,
            header: header,
            uuid: uuid,
            NewsImage:ImageFile
        },
        {
           header:{
            token : `JWT Token`
           }
        }] ```
    - ***Note:*** ***For This Request, admin Has to Login First to Have JWT Token*** 
- **Response :** ``` {
                    title,
                    Description,
                    Date: date,
                    ImageURL: data.Location,
                    header,
                    uuid
                } ```



**Note :** ***Always Remember For Creating News, You Will Have JWT Token, and For JWT Token Have to login First.***
