package com.example.PizzariaGraff;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(properties = {
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration"
})
@TestPropertySource(locations = "classpath:application-test.properties")
class PizzariaGraffApplicationTests {

	@Test
	void contextLoads() {
		// Teste simplificado que verifica se o contexto carrega
	}

}
