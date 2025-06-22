
create database CarAuctionPlatform;
use CarAuctionPlatform;
CREATE TABLE Admin (
    adminID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(50),
    password VARCHAR(255) NOT NULL  -- also hashed
);


CREATE TABLE Customer (
    customerID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    address TEXT,
    password VARCHAR(255) NOT NULL,  -- store a hashed password
    profileImage VARCHAR(255)    
);
CREATE TABLE CarType (
    typeID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(10) NOT NULL, -- e.g., Type A, B, C
    description TEXT,
    requiredLicenseType VARCHAR(10) -- e.g., TYPE_A, TYPE_B
);


CREATE TABLE Car (
    carID INT PRIMARY KEY AUTO_INCREMENT,
    licensePlate VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    year INT,
    status ENUM('available', 'rented', 'underMaintenance', 'auctioned') DEFAULT 'available',
    rentalRate DECIMAL(10, 2),
    typeID INT,
    FOREIGN KEY (typeID) REFERENCES CarType(typeID)
);
CREATE TABLE CarDetails (
    carID INT PRIMARY KEY,
    
    engineType VARCHAR(50),               -- e.g., 2.0L I4
    transmissionType VARCHAR(20),         -- e.g., Automatic
    drivetrain VARCHAR(10),               -- e.g., FWD, AWD
    fuelType VARCHAR(20),                 -- e.g., Gasoline, Electric
    mileage INT,                          -- Odometer reading
    
    vehicleCondition ENUM('Excellent', 'Good', 'Fair', 'Needs Work'),
    accidentHistory TEXT,                 -- e.g., summary of Carfax
    serviceHistory TEXT,                  -- brief maintenance history
    titleStatus ENUM('Clean', 'Salvage', 'Rebuilt'),
    previousOwners INT,

    FOREIGN KEY (carID) REFERENCES Car(carID)
);

CREATE TABLE CarImage (
    imageID INT PRIMARY KEY AUTO_INCREMENT,
    carID INT NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,         -- path or URL
    FOREIGN KEY (carID) REFERENCES Car(carID)
);

CREATE TABLE Driver (
    driverID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    licenseNumber VARCHAR(50) UNIQUE,
    phoneNumber VARCHAR(20),
    licenseType VARCHAR(10), 
    availabilityStatus ENUM('available', 'assigned', 'unavailable') DEFAULT 'available'
);

CREATE TABLE Reservation (
    reservationID INT PRIMARY KEY AUTO_INCREMENT,
    customerID INT,
    carID INT,
    driverID INT NULL,
    reservationDate DATE,
    startDate DATE,
    endDate DATE,
    startTime DATETIME NULL,
    endTime DATETIME NULL,
    status ENUM('confirmed', 'cancelled', 'completed') DEFAULT 'confirmed',
    totalCost DECIMAL(10, 2),
    FOREIGN KEY (customerID) REFERENCES Customer(customerID),
    FOREIGN KEY (carID) REFERENCES Car(carID),
    FOREIGN KEY (driverID) REFERENCES Driver(driverID)
);



CREATE TABLE Payment (
    paymentID INT PRIMARY KEY AUTO_INCREMENT,
    reservationID INT,
    amount DECIMAL(10, 2),
    paymentDate DATE,
    paymentMethod VARCHAR(50),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    FOREIGN KEY (reservationID) REFERENCES Reservation(reservationID)
);

-- create Auction table
CREATE TABLE Auction (
    auctionID INT PRIMARY KEY AUTO_INCREMENT,
    carID INT UNIQUE,
    startDate DATE,
    endDate DATE,
    startingPrice DECIMAL(10, 2),
    status ENUM('scheduled', 'active', 'closed') DEFAULT 'scheduled',
    FOREIGN KEY (carID) REFERENCES Car(carID)
);


-- create bid table
CREATE TABLE Bid (
    bidID INT PRIMARY KEY AUTO_INCREMENT,
    auctionID INT,
    customerID INT,
    amount DECIMAL(10, 2),
    bidTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auctionID) REFERENCES Auction(auctionID),
    FOREIGN KEY (customerID) REFERENCES Customer(customerID)
);