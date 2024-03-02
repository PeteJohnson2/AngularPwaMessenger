/**
 *    Copyright 2018 Sven Loesekann
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */
package ch.xxx.messenger.usecase.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.StreamingChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import ch.xxx.messenger.domain.model.AiConfig;
import ch.xxx.messenger.domain.model.AiMessage;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class AiFriendService {
	private static final Logger LOGGER = LoggerFactory.getLogger(AiFriendService.class);
	@Value("${spring.profiles.active:}")
	private String activeProfile;
	@Value("${spring.ai.ollama.chat.model:}")
	private String aiModel;
	private final StreamingChatClient streamingChatClient;
	
	public AiFriendService(StreamingChatClient streamingChatClient) {
		this.streamingChatClient = streamingChatClient;
	}
	
	public AiConfig createAiConfig() {
		return new AiConfig(this.activeProfile.contains("ollama"), this.aiModel);
	}
	
	public Flux<ChatResponse> talkToSam(AiMessage statement) {
		Prompt prompt = new Prompt(statement);
		return this.streamingChatClient.stream(prompt).onErrorResume(ex -> {
			LOGGER.warn("talkToSam(...) failed.", ex);
			return Mono.just(new ChatResponse(List.of()));	
		});
	}
	
}
