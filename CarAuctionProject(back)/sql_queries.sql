use CarAuctionPlatform;
describe Customer;
ALTER TABLE Customer
ADD COLUMN verificationCode VARCHAR(20),
ADD COLUMN verificationCodeValidation INT,
ADD COLUMN forgotPasswordCode VARCHAR(20),
ADD COLUMN forgotPasswordCodeValidation INT;