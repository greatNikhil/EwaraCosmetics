-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: ewara
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `lastname` varchar(255) DEFAULT '',
  `address` text NOT NULL,
  `phone` varchar(20) NOT NULL,
  `pincode` varchar(20) NOT NULL,
  `flat` varchar(255) DEFAULT '',
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `default` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `addresses_user_default` (`user`,`default`),
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,1,'Nikhil','chaubey','Tenua chaubey','9979926816','226026','','Lucknow','Uttar Pradesh',1,'2026-04-29 10:24:02','2026-04-29 10:24:02'),(2,2,'Nikhil','chaubey','Tenua chaubey','9979926816','274182','','Deoria','Uttar Pradesh',1,'2026-06-09 01:24:02','2026-06-09 01:24:02');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `image` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `added_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_user_id_product_id` (`user_id`,`product_id`),
  KEY `cart_items_added_at` (`added_at`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `type` enum('percent','flat') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_order_amount` decimal(10,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `max_uses` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  UNIQUE KEY `code_3` (`code`),
  UNIQUE KEY `code_4` (`code`),
  UNIQUE KEY `code_5` (`code`),
  UNIQUE KEY `code_6` (`code`),
  UNIQUE KEY `code_7` (`code`),
  UNIQUE KEY `code_8` (`code`),
  UNIQUE KEY `code_9` (`code`),
  UNIQUE KEY `code_10` (`code`),
  UNIQUE KEY `code_11` (`code`),
  UNIQUE KEY `code_12` (`code`),
  UNIQUE KEY `code_13` (`code`),
  UNIQUE KEY `code_14` (`code`),
  UNIQUE KEY `code_15` (`code`),
  UNIQUE KEY `code_16` (`code`),
  UNIQUE KEY `code_17` (`code`),
  UNIQUE KEY `code_18` (`code`),
  UNIQUE KEY `code_19` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exchange_requests`
--

DROP TABLE IF EXISTS `exchange_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exchange_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` int NOT NULL,
  `order` int NOT NULL,
  `product_id` int NOT NULL,
  `reason` varchar(100) NOT NULL COMMENT 'Reason for exchange (e.g., Wrong Size, Defective, Changed Mind)',
  `description` text,
  `status` enum('Pending','Approved','Rejected','Exchanged') NOT NULL DEFAULT 'Pending',
  `replacement_product` int DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `order` (`order`),
  KEY `product_id` (`product_id`),
  KEY `replacement_product` (`replacement_product`),
  CONSTRAINT `exchange_requests_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`id`),
  CONSTRAINT `exchange_requests_ibfk_2` FOREIGN KEY (`order`) REFERENCES `orders` (`id`),
  CONSTRAINT `exchange_requests_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `exchange_requests_ibfk_4` FOREIGN KEY (`replacement_product`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exchange_requests`
--

LOCK TABLES `exchange_requests` WRITE;
/*!40000 ALTER TABLE `exchange_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `exchange_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `newsletter_subscribers_email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `offers`
--

DROP TABLE IF EXISTS `offers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` varchar(500) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `offers_is_active_display_order_created_at` (`is_active`,`display_order`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `offers`
--

LOCK TABLES `offers` WRITE;
/*!40000 ALTER TABLE `offers` DISABLE KEYS */;
INSERT INTO `offers` VALUES (1,'Get 10% off on orders above Rs.888',1,46,'2026-04-29 10:44:45','2026-05-13 14:13:27');
/*!40000 ALTER TABLE `offers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` int DEFAULT NULL,
  `items` json NOT NULL,
  `subtotal_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `coupon_code` varchar(50) DEFAULT NULL,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `gst_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `shipping_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'COD',
  `payment_status` varchar(50) DEFAULT 'Pending',
  `status` varchar(50) DEFAULT 'Pending',
  `shipping_address` json DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `stock_restored` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'[{\"name\": \"EWARA Smoothness Expert Hair Conditioner\", \"image\": \"/productsnik/products/conditionar/Use_the_uploaded_image_as_202604290045.jpeg\", \"price\": 2, \"quantity\": 1, \"productId\": 1}]',2.00,NULL,0.00,0.00,0.00,2.00,'Razorpay - UPI','Completed','Processing','{\"city\": \"Lucknow\", \"state\": \"Uttar Pradesh\", \"country\": \"India\", \"fullName\": \"Nikhil chaubey\", \"postalCode\": \"226026\", \"phoneNumber\": \"9979926816\", \"addressLine1\": \"Tenua chaubey\", \"addressLine2\": \"\"}','pay_SjH5uokxAHVJYB','order_SjH5OoUOVzvckC',0,'2026-04-29 10:25:47','2026-04-29 10:25:47'),(2,1,'[{\"name\": \"EWARA Smoothness Expert Hair Conditioner\", \"image\": \"/productsnik/products/conditionar/ChatGPT Image Apr 29, 2026, 01_08_14 AM.png\", \"price\": 2, \"quantity\": 1, \"productId\": 1}]',2.00,NULL,0.00,0.00,0.00,2.00,'Razorpay','Completed','Processing','{\"city\": \"Lucknow\", \"state\": \"Uttar Pradesh\", \"country\": \"India\", \"fullName\": \"Nikhil chaubey\", \"postalCode\": \"226026\", \"phoneNumber\": \"9979926816\", \"addressLine1\": \"Tenua chaubey\", \"addressLine2\": \"\"}','pay_SoU2nwhy0cfFH9','order_SoU2OgWAxJqwcC',0,'2026-05-12 14:20:54','2026-05-12 14:20:54'),(3,1,'[{\"name\": \"EWARA Smoothness Expert Hair Conditioner\", \"image\": \"/productsnik/products/conditionar/ChatGPT Image Apr 29, 2026, 01_08_14 AM.png\", \"price\": 2, \"quantity\": 1, \"productId\": 1}]',2.00,NULL,0.00,0.00,0.00,2.00,'Razorpay','Refunded','Cancelled','{\"city\": \"Lucknow\", \"state\": \"Uttar Pradesh\", \"country\": \"India\", \"fullName\": \"Nikhil chaubey\", \"postalCode\": \"226026\", \"phoneNumber\": \"9979926816\", \"addressLine1\": \"Tenua chaubey\", \"addressLine2\": \"\"}','pay_SoU2nwhy0cfFH9','order_SoU2OgWAxJqwcC',1,'2026-05-12 14:20:56','2026-05-12 14:43:57'),(4,1,'[{\"name\": \"EWARA Smoothness Expert Hair Conditioner\", \"image\": \"/productsnik/products/conditionar/ChatGPT Image Apr 29, 2026, 01_08_14 AM.png\", \"price\": 2, \"quantity\": 1, \"productId\": 1}]',2.00,NULL,0.00,0.00,0.00,2.00,'Razorpay','Completed','Processing','{\"city\": \"Lucknow\", \"state\": \"Uttar Pradesh\", \"country\": \"India\", \"fullName\": \"Nikhil chaubey\", \"postalCode\": \"226026\", \"phoneNumber\": \"9979926816\", \"addressLine1\": \"Tenua chaubey\", \"addressLine2\": \"\"}','pay_SoUZ5FjIWKx974','order_SoUYhns0RMFtEu',0,'2026-05-12 14:51:30','2026-05-12 14:51:30'),(5,1,'[{\"name\": \"EWARA Smoothness Expert Hair Conditioner\", \"image\": \"/productsnik/products/conditionar/ChatGPT Image Apr 29, 2026, 01_08_14 AM.png\", \"price\": 2, \"quantity\": 1, \"productId\": 1}]',2.00,NULL,0.00,0.00,0.00,2.00,'Razorpay','Refunded','Cancelled','{\"city\": \"Lucknow\", \"state\": \"Uttar Pradesh\", \"country\": \"India\", \"fullName\": \"Nikhil chaubey\", \"postalCode\": \"226026\", \"phoneNumber\": \"9979926816\", \"addressLine1\": \"Tenua chaubey\", \"addressLine2\": \"\"}','pay_SoUZ5FjIWKx974','order_SoUYhns0RMFtEu',1,'2026-05-12 14:51:39','2026-05-12 15:03:40'),(6,1,'[{\"name\": \"EWARA Smoothness Expert Hair Conditioner\", \"image\": \"/productsnik/products/conditionar/ChatGPT Image Apr 29, 2026, 01_08_14 AM.png\", \"price\": 2, \"quantity\": 1, \"productId\": 1}]',2.00,NULL,0.00,0.00,0.00,2.00,'Razorpay','Completed','Processing','{\"city\": \"Lucknow\", \"state\": \"Uttar Pradesh\", \"country\": \"India\", \"fullName\": \"Nikhil chaubey\", \"postalCode\": \"226026\", \"phoneNumber\": \"9979926816\", \"addressLine1\": \"Tenua chaubey\", \"addressLine2\": \"\"}','pay_Sos2xSRIFdJech','order_Sos2kFFNT84dKk',0,'2026-05-13 13:49:40','2026-05-13 13:49:40'),(7,1,'[{\"name\": \"EWARA Smoothness Expert Hair Conditioner\", \"image\": \"/productsnik/products/conditionar/ChatGPT Image Apr 29, 2026, 01_08_14 AM.png\", \"price\": 2, \"quantity\": 1, \"productId\": 1}]',2.00,NULL,0.00,0.00,0.00,2.00,'Razorpay','Completed','Processing','{\"city\": \"Lucknow\", \"state\": \"Uttar Pradesh\", \"country\": \"India\", \"fullName\": \"Nikhil chaubey\", \"postalCode\": \"226026\", \"phoneNumber\": \"9979926816\", \"addressLine1\": \"Tenua chaubey\", \"addressLine2\": \"\"}','pay_Sos2xSRIFdJech','order_Sos2kFFNT84dKk',0,'2026-05-13 13:49:50','2026-05-13 13:49:50'),(8,1,'[{\"name\": \"EWARA Smoothness Expert Hair Conditioner\", \"image\": \"/productsnik/products/conditionar/ChatGPT Image Apr 29, 2026, 01_08_14 AM.png\", \"price\": 2, \"quantity\": 1, \"productId\": 1}]',2.00,NULL,0.00,0.00,50.00,52.00,'Cash on Delivery','Completed','Shipped','{\"city\": \"Lucknow\", \"state\": \"Uttar Pradesh\", \"country\": \"India\", \"fullName\": \"Nikhil chaubey\", \"postalCode\": \"226026\", \"phoneNumber\": \"9979926816\", \"addressLine1\": \"Tenua chaubey\", \"addressLine2\": \"\"}',NULL,NULL,0,'2026-06-09 01:36:36','2026-06-09 01:42:12');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otps`
--

DROP TABLE IF EXISTS `otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otps`
--

LOCK TABLES `otps` WRITE;
/*!40000 ALTER TABLE `otps` DISABLE KEYS */;
INSERT INTO `otps` VALUES (1,'chaturom17@gmail.com','262969','2026-05-13 14:21:36','2026-05-13 14:16:36','2026-05-13 14:16:36'),(3,'chaubeyambujesh111@gmail.com','167093','2026-05-27 08:24:14','2026-05-27 08:19:14','2026-05-27 08:19:14');
/*!40000 ALTER TABLE `otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `short_description` varchar(300) DEFAULT '',
  `brand` varchar(255) DEFAULT '',
  `category` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT '0.00',
  `discount_percent` int DEFAULT '0',
  `count_in_stock` int NOT NULL DEFAULT '0',
  `images` text NOT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `is_published` tinyint(1) DEFAULT '1',
  `rating` decimal(3,2) DEFAULT '0.00',
  `num_reviews` int DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `show_in_new_arrivals` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `products_slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  UNIQUE KEY `slug_3` (`slug`),
  UNIQUE KEY `slug_4` (`slug`),
  UNIQUE KEY `slug_5` (`slug`),
  UNIQUE KEY `slug_6` (`slug`),
  UNIQUE KEY `slug_7` (`slug`),
  UNIQUE KEY `slug_8` (`slug`),
  UNIQUE KEY `slug_9` (`slug`),
  UNIQUE KEY `slug_10` (`slug`),
  UNIQUE KEY `slug_11` (`slug`),
  UNIQUE KEY `slug_12` (`slug`),
  UNIQUE KEY `slug_13` (`slug`),
  UNIQUE KEY `slug_14` (`slug`),
  UNIQUE KEY `slug_15` (`slug`),
  UNIQUE KEY `slug_16` (`slug`),
  UNIQUE KEY `slug_17` (`slug`),
  UNIQUE KEY `slug_18` (`slug`),
  UNIQUE KEY `slug_19` (`slug`),
  UNIQUE KEY `slug_20` (`slug`),
  UNIQUE KEY `slug_21` (`slug`),
  KEY `products_category` (`category`),
  KEY `products_brand` (`brand`),
  KEY `products_is_featured` (`is_featured`),
  KEY `products_is_published` (`is_published`),
  KEY `products_created_at` (`created_at`),
  KEY `products_show_in_new_arrivals` (`show_in_new_arrivals`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'EWARA Smoothness Expert Hair Conditioner','ewara-smoothness-expert-hair-conditioner','Tired of dull, frizzy, and unmanageable hair? EWARA Smoothness Expert Conditioner is formulated with Argan Oil, Aloe Vera, Bhringraj, Shea Butter and Panthenol to deeply nourish every strand. It helps tame flyaways, moisturize dry ends, improve shine and leave hair soft, smooth and easy to manage. Suitable for natural, chemically treated and color-treated hair. Apply after shampooing on damp hair from mid-lengths to ends, leave for 2–3 minutes and rinse thoroughly.','Argan Oil, Aloe Vera & Bhringraj conditioner for frizz-free, silky and shiny hair.','EWARA','Hair',2.00,449.00,22,58,'[\"/productsnik/products/conditionar/ChatGPT Image Apr 29, 2026, 01_08_14 AM.png\",\"/productsnik/products/conditionar/EWARA_Argan_Oil_Conditioner_elem…_202604290046.jpeg\",\"/productsnik/products/conditionar/Model_with_EWARA_Argan_Oil_202604290045.jpeg\",\"/productsnik/products/conditionar/Use_the_uploaded_image_as_202604290045.jpeg\"]',1,1,0.00,0,'2026-04-28 22:41:23','2026-06-09 01:36:36',0),(2,'EWARA Onion Shampoo for Hair Fall Control','ewara-onion-shampoo-hair-fall-control','EWARA Onion Shampoo is a hair fall control shampoo made with Onion Extract, Bhringraj, Curry Leaves and Lavender. It gently cleanses the scalp while supporting stronger roots, reducing breakage and promoting healthy-looking hair growth. The formula removes dirt and excess oil without stripping natural moisture, leaving hair shiny, bouncy and fresh. Suitable for men and women with dry, oily, normal or color-treated hair.','Onion, Bhringraj & Curry Leaves shampoo for stronger roots and healthy growth.','EWARA','Hair',299.00,399.00,25,75,'[\"/productsnik/products/onion shampoo/1777013744938.png\",\"/productsnik/products/onion shampoo/1777013812610.png\",\"/productsnik/products/onion shampoo/1777014386280.png\",\"/productsnik/products/onion shampoo/1777014502758.png\",\"/productsnik/products/onion shampoo/1777014634448.png\",\"/productsnik/products/onion shampoo/1777014828287.png\",\"/productsnik/products/onion shampoo/1777015077812.png\"]',1,1,0.00,0,'2026-04-28 22:41:23','2026-04-29 12:41:56',0),(3,'EWARA Rice Water Hair Growth Shampoo','ewara-rice-water-hair-growth-shampoo','EWARA Rice Water Hair Growth Shampoo combines Rice Water, Amla and Aloe Vera to help strengthen weak strands, reduce breakage and support longer, thicker-looking hair. The Damage Defender formula helps repair brittle hair, moisturize the scalp and add natural volume and shine. Use 2–3 times a week and follow with EWARA Smoothness Expert Conditioner for best results.','Rice Water, Amla & Aloe Vera shampoo for long, strong and thick hair.','EWARA','Hair',299.00,399.00,25,70,'[\"/productsnik/products/rice water/1777182491427.png\",\"/productsnik/products/rice water/1777183032613.png\",\"/productsnik/products/rice water/1777183184033.png\",\"/productsnik/products/rice water/1777183467248.png\",\"/productsnik/products/rice water/1777183588233.png\"]',1,1,0.00,0,'2026-04-28 22:41:23','2026-04-29 12:41:56',0),(4,'EWARA Ubtan Glow Facewash','ewara-ubtan-glow-facewash','EWARA Ubtan Glow Facewash brings traditional Ubtan care into a daily face wash. Infused with Turmeric, Saffron and Sandalwood Extract, it helps brighten the skin, remove tan, gently exfoliate dead skin cells and deep cleanse oil, dirt and pollution. Suitable for all skin types and ideal for both men and women who want fresh, radiant and confident-looking skin.','Turmeric and Saffron facewash for de-tan, skin brightening and radiant glow.','EWARA','Skincare',199.00,249.00,20,90,'[\"/productsnik/products/ubton facewash/IMG-20260411-WA0056.jpg.jpeg\",\"/productsnik/products/ubton facewash/IMG-20260411-WA0067.jpg.jpeg\",\"/productsnik/products/ubton facewash/IMG-20260411-WA0068.jpg.jpeg\",\"/productsnik/products/ubton facewash/IMG-20260411-WA0073.jpg.jpeg\"]',1,1,0.00,0,'2026-04-28 22:41:23','2026-04-29 12:41:56',0),(5,'EWARA Activated Charcoal Facewash','ewara-activated-charcoal-facewash','EWARA Activated Charcoal Facewash is designed for deep detox, oil control and pollution defense. Activated Charcoal helps draw out impurities and unclog pores, while the pH-balanced, paraben-free and sulphate-free formula cleanses without making skin feel tight or dry. Best suited for oily and combination skin but gentle enough for all skin types.','Activated Charcoal facewash for deep detox, pollution defense and oil control.','EWARA','Skincare',199.00,249.00,20,85,'[\"/productsnik/products/carcole/IMG-20260411-WA0036.jpg.jpeg\",\"/productsnik/products/carcole/IMG-20260411-WA0050.jpg.jpeg\",\"/productsnik/products/carcole/IMG-20260411-WA0051.jpg.jpeg\",\"/productsnik/products/carcole/IMG-20260411-WA0055.jpg.jpeg\"]',0,1,0.00,0,'2026-04-28 22:41:23','2026-04-29 12:41:56',0),(6,'EWARA Anti-Bacterial Tea Tree Facewash','ewara-anti-bacterial-tea-tree-facewash','EWARA Anti-Bacterial Tea Tree Facewash is formulated with Tea Tree Oil, Neem Extracts and Aloe Vera to help fight acne-causing bacteria, control excess oil and keep skin fresh. It deep cleans pores, removes dirt and pollution, supports a matte finish and helps reduce pimples and dullness. The formula is paraben-free, sulphate-free and soap-free for daily use.','Tea Tree, Neem and Aloe Vera facewash for acne, pimples and oil control.','EWARA','Skincare',199.00,249.00,20,88,'[\"/productsnik/products/tea tree facewash/1777013015417.png\",\"/productsnik/products/tea tree facewash/1777013272914.png\",\"/productsnik/products/tea tree facewash/file_00000000370c71fb9d32bb209b7e40fb.png\",\"/productsnik/products/tea tree facewash/file_0000000039f471fb9b82d9b3f3539525.png\",\"/productsnik/products/tea tree facewash/file_00000000bb0471fb9b6c6c28e932d9a3.png\"]',0,1,0.00,0,'2026-04-28 22:41:23','2026-04-29 12:41:56',1),(7,'EWARA Wild Lust Solid Perfume','ewara-wild-lust-solid-perfume','EWARA Wild Lust Solid Perfume is an alcohol-free 10g balm perfume made for bold, intense and long-lasting fragrance. The wax-based formula stays close to pulse points and slowly releases scent through body heat. It is pocket-friendly, travel-safe, discreet and suitable for men and women. Apply on wrists, neck and behind the ears for a confident fragrance touch-up anytime.','Alcohol-free 10g solid perfume with bold, intense and long-lasting fragrance.','EWARA','Fragrance',249.00,349.00,29,65,'[\"/Product/products/wild-lust/20.jpeg\",\"/Product/products/wild-lust/l9.jpeg\"]',1,1,0.00,0,'2026-04-28 22:41:23','2026-04-29 12:41:56',0),(8,'EWARA Moon Kiss Solid Perfume','ewara-moon-kiss-solid-perfume','EWARA Moon Kiss Solid Perfume is a soft, romantic and elegant alcohol-free fragrance balm in a 10g travel-friendly tin. The solid formula glides smoothly, stays close to the skin and slowly releases scent through body heat. It is paraben-free, leak-proof and ideal for office wear, gifting, evenings and quick fragrance touch-ups on the go.','Alcohol-free 10g solid perfume with soft, romantic and elegant fragrance.','EWARA','Fragrance',249.00,349.00,29,65,'[\"/Product/products/moon-kiss/m1.jpeg\",\"/Product/products/moon-kiss/m3.jpeg\"]',1,1,0.00,0,'2026-04-28 22:41:23','2026-04-29 12:41:56',0),(9,'EWARA Honey & Almond Bliss Body Lotion - 500ml','ewara-honey-almond-bliss-body-lotion','Indulge your skin in rich nourishment with EWARA Honey & Almond Bliss Body Lotion. Powered with the goodness of honey, almond oil, and Vitamin E, this lotion deeply moisturizes, leaving your skin soft, smooth, and naturally radiant. Honey helps lock in moisture and keeps skin hydrated, almond oil nourishes deeply and improves softness, and Vitamin E supports healthy-looking glowing skin. The lightweight, fast-absorbing, non-sticky formula provides long-lasting hydration, making it comfortable for daily use across all skin types. Apply generously on clean skin and massage gently until absorbed. Best used after bath for long-lasting hydration.','Honey, almond oil and Vitamin E body lotion for soft, nourished and hydrated skin.','EWARA','Skincare',299.00,399.00,25,0,'[\"/productsnik/products/honey and almond/Body_lotion_with_ingredients_sho…_202604290058.jpeg\",\"/productsnik/products/honey and almond/EWARA_Honey_Almond_Lotion_202604290056.jpeg\",\"/productsnik/products/honey and almond/Screenshot 2026-04-29 010203.png\",\"/productsnik/products/honey and almond/Use_the_uploaded_image_as_202604290057.jpeg\"]',0,1,0.00,0,'2026-04-28 22:41:23','2026-04-29 12:41:56',0),(10,'EWARA Fruit Bliss Body Lotion - Mix Fruit Extracts | 500ml','ewara-fruit-bliss-body-lotion','Pamper your skin daily with EWARA Fruit Bliss Body Lotion, a nourishing blend of fruit extracts and Vitamin E designed to keep your skin hydrated, soft, and naturally glowing. The fruit-powered formula supports healthy-looking skin, helps lock in moisture, and leaves a refreshing fruity fragrance. Its lightweight, fast-absorbing texture avoids sticky or oily residue while helping maintain a smooth, supple, and radiant feel. Suitable for daily skincare routines and all skin types. Apply evenly on clean skin and massage gently until fully absorbed. Use daily for best results.','Mixed fruit extracts and Vitamin E body lotion for soft, glowing and hydrated skin.','EWARA','Skincare',299.00,399.00,25,0,'[\"/productsnik/products/mix fruit/ChatGPT Image Apr 29, 2026, 01_05_27 AM.png\",\"/productsnik/products/mix fruit/EWARA_Fruit_Bliss_Body_Lotion_202604290041.jpeg\",\"/productsnik/products/mix fruit/EWARA_Fruit_Bliss_Body_Lotion_202604290042.jpeg\",\"/productsnik/products/mix fruit/Use_the_uploaded_image_as_202604290040.jpeg\"]',0,1,0.00,0,'2026-04-28 22:41:23','2026-04-29 12:41:56',0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refund_requests`
--

DROP TABLE IF EXISTS `refund_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refund_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` int NOT NULL,
  `order` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `refund_method` varchar(100) DEFAULT 'Original Payment',
  `status` enum('Pending','Approved','Rejected','Processed','Cancelled') DEFAULT 'Pending',
  `admin_notes` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `order` (`order`),
  CONSTRAINT `refund_requests_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`id`),
  CONSTRAINT `refund_requests_ibfk_2` FOREIGN KEY (`order`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refund_requests`
--

LOCK TABLES `refund_requests` WRITE;
/*!40000 ALTER TABLE `refund_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `refund_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refunds`
--

DROP TABLE IF EXISTS `refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refunds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` int NOT NULL,
  `order` int NOT NULL,
  `return_request` int DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('Pending','Processing','Completed','Failed','Cancelled') NOT NULL DEFAULT 'Pending',
  `refund_method` enum('Original Payment','Bank Transfer','Store Credit') NOT NULL DEFAULT 'Original Payment',
  `refund_details` text COMMENT 'Additional details about the refund (e.g., transaction ID, bank details)',
  `processed_at` datetime DEFAULT NULL COMMENT 'Timestamp when refund was processed',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `order` (`order`),
  KEY `return_request` (`return_request`),
  CONSTRAINT `refunds_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`id`),
  CONSTRAINT `refunds_ibfk_2` FOREIGN KEY (`order`) REFERENCES `orders` (`id`),
  CONSTRAINT `refunds_ibfk_3` FOREIGN KEY (`return_request`) REFERENCES `return_requests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refunds`
--

LOCK TABLES `refunds` WRITE;
/*!40000 ALTER TABLE `refunds` DISABLE KEYS */;
/*!40000 ALTER TABLE `refunds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_requests`
--

DROP TABLE IF EXISTS `return_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` int NOT NULL,
  `order` int NOT NULL,
  `product_id` int NOT NULL,
  `reason` varchar(100) NOT NULL COMMENT 'Reason for return (e.g., Not As Described, Defective, Changed Mind)',
  `description` text,
  `status` enum('Pending','Approved','Rejected','Returned','Completed') NOT NULL DEFAULT 'Pending',
  `refund_amount` decimal(12,2) DEFAULT NULL COMMENT 'Amount to be refunded (may be less than original due to deductions)',
  `tracking_number` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `order` (`order`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `return_requests_ibfk_1` FOREIGN KEY (`user`) REFERENCES `users` (`id`),
  CONSTRAINT `return_requests_ibfk_2` FOREIGN KEY (`order`) REFERENCES `orders` (`id`),
  CONSTRAINT `return_requests_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_requests`
--

LOCK TABLES `return_requests` WRITE;
/*!40000 ALTER TABLE `return_requests` DISABLE KEYS */;
INSERT INTO `return_requests` VALUES (1,1,5,1,'Changed Mind','njnfewjnjdnj','Pending',NULL,NULL,'2026-05-12 15:01:52','2026-05-12 15:01:52');
/*!40000 ALTER TABLE `return_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product` int NOT NULL,
  `user` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `rating` int NOT NULL,
  `comment` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_product_user` (`product`,`user`),
  KEY `reviews_product` (`product`),
  KEY `reviews_user` (`user`),
  KEY `reviews_created_at` (`created_at`),
  CONSTRAINT `reviews_ibfk_37` FOREIGN KEY (`product`) REFERENCES `products` (`id`),
  CONSTRAINT `reviews_ibfk_38` FOREIGN KEY (`user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `lastname` varchar(255) DEFAULT '',
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `avatar` text,
  `role` varchar(50) DEFAULT 'user',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `is_blocked` tinyint(1) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `avatar_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `google_id` (`google_id`),
  UNIQUE KEY `phone_2` (`phone`),
  UNIQUE KEY `google_id_2` (`google_id`),
  UNIQUE KEY `phone_3` (`phone`),
  UNIQUE KEY `google_id_3` (`google_id`),
  UNIQUE KEY `phone_4` (`phone`),
  UNIQUE KEY `google_id_4` (`google_id`),
  UNIQUE KEY `phone_5` (`phone`),
  UNIQUE KEY `google_id_5` (`google_id`),
  UNIQUE KEY `phone_6` (`phone`),
  UNIQUE KEY `google_id_6` (`google_id`),
  UNIQUE KEY `phone_7` (`phone`),
  UNIQUE KEY `google_id_7` (`google_id`),
  UNIQUE KEY `phone_8` (`phone`),
  UNIQUE KEY `google_id_8` (`google_id`),
  UNIQUE KEY `phone_9` (`phone`),
  UNIQUE KEY `google_id_9` (`google_id`),
  UNIQUE KEY `phone_10` (`phone`),
  UNIQUE KEY `google_id_10` (`google_id`),
  UNIQUE KEY `phone_11` (`phone`),
  UNIQUE KEY `google_id_11` (`google_id`),
  UNIQUE KEY `phone_12` (`phone`),
  UNIQUE KEY `google_id_12` (`google_id`),
  UNIQUE KEY `phone_13` (`phone`),
  UNIQUE KEY `google_id_13` (`google_id`),
  UNIQUE KEY `phone_14` (`phone`),
  UNIQUE KEY `google_id_14` (`google_id`),
  UNIQUE KEY `phone_15` (`phone`),
  UNIQUE KEY `google_id_15` (`google_id`),
  UNIQUE KEY `phone_16` (`phone`),
  UNIQUE KEY `google_id_16` (`google_id`),
  UNIQUE KEY `phone_17` (`phone`),
  UNIQUE KEY `google_id_17` (`google_id`),
  UNIQUE KEY `phone_18` (`phone`),
  UNIQUE KEY `google_id_18` (`google_id`),
  UNIQUE KEY `phone_19` (`phone`),
  UNIQUE KEY `google_id_19` (`google_id`),
  UNIQUE KEY `phone_20` (`phone`),
  UNIQUE KEY `google_id_20` (`google_id`),
  UNIQUE KEY `phone_21` (`phone`),
  UNIQUE KEY `google_id_21` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Nikhil','Chaubey','chaubeynikhil649@gmail.com',NULL,'$2b$10$3Q.OdbkKYyIbXcMbVFU/KO6B8OeYT6wkpdSStJ1tvluMWfPNe1Ipe',NULL,'','admin','2026-04-28 22:46:30','2026-04-28 22:46:30',0,0,NULL),(2,'Nikhil chaubey','','chaubeyji7143@gmail.com','7202042593','$2b$10$y4FV3pOVK/6Nuq4jZYpNJehLiozeCAu0R/FCD/0Hb5P6.YtmxYoQy',NULL,'','user','2026-05-13 14:18:40','2026-05-13 14:22:59',0,0,'/uploads/avatars/avatar-2-1778682179178.jpeg');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `added_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlist_items_user_id_product_id` (`user_id`,`product_id`),
  KEY `wishlist_items_added_at` (`added_at`),
  CONSTRAINT `wishlist_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-09 15:09:52
