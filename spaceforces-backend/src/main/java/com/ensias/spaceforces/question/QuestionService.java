package com.ensias.spaceforces.question;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ensias.spaceforces.exception.ResourceNotFoundException;
import com.ensias.spaceforces.option.dto.OptionInfosDTO;
import com.ensias.spaceforces.question.dto.QuestionDTO;
import com.ensias.spaceforces.quiz.Quiz;
import com.ensias.spaceforces.quiz.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ensias.spaceforces.option.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final OptionRepository optionRepository;
    private final Cloudinary cloudinary;


    @Transactional
    public QuestionDTO createQuestionWithImage(QuestionDTO questionDTO, MultipartFile imageFile)
            throws IOException {

        Quiz quiz = quizRepository.findById(questionDTO.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + questionDTO.getQuizId()));

        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(
                        imageFile.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "spaceforces/questions",
                                "public_id", "question_" + System.currentTimeMillis()
                        )
                );
                imageUrl = (String) uploadResult.get("url");
            } catch (IOException e) {
                throw new IOException("Failed to upload image to Cloudinary: " + e.getMessage());
            }
        }

        Question question = new Question();
        question.setQuiz(quiz);
        question.setPoints(questionDTO.getPoints());
        question.setTags(questionDTO.getTags());
        question.setQuestionText(questionDTO.getQuestionText());
        question.setCorrectOption(questionDTO.getCorrectOption());
        question.setImageUrl(imageUrl);

        Question savedQuestion = questionRepository.save(question);

        return convertToDTO(savedQuestion);
    }

    @Transactional
    public QuestionDTO addImageToQuestion(Long questionId, MultipartFile imageFile) throws IOException {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        Map<?, ?> uploadResult = cloudinary.uploader().upload(
                imageFile.getBytes(),
                ObjectUtils.asMap(
                        "folder", "spaceforces/questions",
                        "public_id", "question_" + questionId + "_" + System.currentTimeMillis()
                )
        );
        String imageUrl = (String) uploadResult.get("url");

        question.setImageUrl(imageUrl);
        Question savedQuestion = questionRepository.save(question);

        return convertToDTO(savedQuestion);
    }

    public List<Question> getAllQuestions() {
        return new ArrayList<>(questionRepository.findAll());
    }
    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
    }

    private QuestionDTO convertToDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setQuizId(question.getQuiz().getId());
        dto.setPoints(question.getPoints());
        dto.setTags(question.getTags());
        dto.setQuestionText(question.getQuestionText());
        dto.setCorrectOption(question.getCorrectOption());
        dto.setImageUrl(question.getImageUrl());

        return dto;
    }

    @Transactional(readOnly = true)
    public List<OptionInfosDTO> getQuestionOptions(Long questionId) {
        return optionRepository.findByQuestionId(questionId).stream()
                .map(this::convertToOptionDTO)
                .toList();
    }


    private OptionInfosDTO convertToOptionDTO(Option option) {
        OptionInfosDTO dto = new OptionInfosDTO();
        dto.setId(option.getId());
        dto.setOptionText(option.getOptionText());
        dto.setValid(option.isValid());
        return dto;
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        questionRepository.delete(question);
    }

}
