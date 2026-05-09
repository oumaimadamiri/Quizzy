package com.quizmanager.config;

import com.quizmanager.model.User.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/auth/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/api-docs/**"
                ).permitAll()
                
                .requestMatchers(
                    "/quizzes/published",           
                    "/quizzes/{id}/take",           
                    "/quizzes/{id}/submit"          
                ).hasAnyAuthority(Role.STUDENT.name(), Role.PROFESSOR.name(), Role.ADMIN.name())
                
                .requestMatchers(
                    "/questions/quiz/{quizId}"      
                ).hasAnyAuthority(Role.STUDENT.name(), Role.PROFESSOR.name(), Role.ADMIN.name())
                
                .requestMatchers(
                    "/attempts/user/**",           
                    "/attempts/{attemptId}",        
                    "/users/me",                   
                    "/users/me/**"                 
                ).hasAnyAuthority(Role.STUDENT.name(), Role.PROFESSOR.name(), Role.ADMIN.name())
                
                .requestMatchers(
                    "/questions",                   
                    "/questions/{id}",              
                    "/questions/category/**",      
                    "/questions/random/**",        
                    "/questions/count/**"           
                ).hasAnyAuthority(Role.PROFESSOR.name(), Role.ADMIN.name())
                
                .requestMatchers(
                    "/quizzes",                    
                    "/quizzes/**",                  
                    "/attempts/quiz/**",      
                    "/attempts/quiz/{quizId}/students",     
                    "/users/quiz/{quizId}/attempts" 
                ).hasAnyAuthority(Role.PROFESSOR.name(), Role.ADMIN.name())
                
                .requestMatchers(
                    "/users",
                    "/users/{id}",
                    "/users/{id}/**",
                    "/users/students",
                    "/users/professors",
                    "/admin/**"
                ).hasAuthority(Role.ADMIN.name())
                
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())  
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) 
            throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}