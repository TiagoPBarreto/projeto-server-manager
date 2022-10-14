package io.getarrays.server;

import io.getarrays.server.enumeration.Status;
import io.getarrays.server.model.Server;
import io.getarrays.server.repository.ServerRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.lang.reflect.Array;
import java.util.Arrays;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

	@Bean
	CommandLineRunner run(ServerRepo serverRepo){
		return  args -> {
			serverRepo.save(new Server(null,"192.168.1.160","Ubuntu Linux","16 GB","Personal PC","http://localhost:8080/server/image/server1", Status.SERVER_UP));
			serverRepo.save(new Server(null,"196.168.1.160","macOS ","32 GB","Personal PC","http://localhost:8080/server/image/server3", Status.SERVER_UP));
			serverRepo.save(new Server(null,"197.168.1.160","mint Linux","8 GB","Personal PC","http://localhost:8080/server/image/server2", Status.SERVER_DOW));
		};
	}
	@Bean
	public CorsFilter corsFilter(){
		UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
		CorsConfiguration corsConfiguration = new CorsConfiguration();
		corsConfiguration.setAllowCredentials(true);
		corsConfiguration.setAllowedOrigins(Arrays.asList("http://localhost:3000","http://localhost:4200"));
		corsConfiguration.setAllowedHeaders(Arrays.asList("Origin","Acces-Control-Allow-Origin","Content-Type",
				"Accept","Jwt-Token","Authorization","Origin","Accept","X-Requested-With",
				"Access-Control-Request-Method","Access-Control-Request-Headers"));
		corsConfiguration.setExposedHeaders(Arrays.asList("Origin","Content-Type","Accept","Jet-Token","Authorization",
				"Access-Control-Allow-Origin","Access-Control-Allow-Origin","Access-Control-Allow-Credentials","Filename"));
		corsConfiguration.setAllowedMethods(Arrays.asList("GET","POST","PATH","DELETE","OPTIONS"));
		urlBasedCorsConfigurationSource.registerCorsConfiguration("/**",corsConfiguration);
		return new CorsFilter(urlBasedCorsConfigurationSource);
	}

}
