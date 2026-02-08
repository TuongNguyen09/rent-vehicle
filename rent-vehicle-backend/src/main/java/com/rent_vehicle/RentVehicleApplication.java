package com.rent_vehicle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class RentVehicleApplication {

	public static void main(String[] args) {
		SpringApplication.run(RentVehicleApplication.class, args);
	}

}
