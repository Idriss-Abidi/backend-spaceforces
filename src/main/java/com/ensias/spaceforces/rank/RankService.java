package com.ensias.spaceforces.rank;

import com.ensias.spaceforces.rank.dto.RankDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankService {

    private final RankRepository rankRepository;

    public RankDTO createRank(RankDTO rankDTO) {
        validatePoints(rankDTO);

        Rank rank = new Rank();
        rank.setTitle(rankDTO.getTitle());
        rank.setAbbreviation(rankDTO.getAbbreviation());
        rank.setMinPoints(rankDTO.getMinPoints());
        rank.setMaxPoints(rankDTO.getMaxPoints());

        Rank savedRank = rankRepository.save(rank);
        return convertToDTO(savedRank);
    }

    public List<RankDTO> getAllRanks() {
        return rankRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RankDTO getRankById(Long id) {
        Rank rank = rankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rank not found"));
        return convertToDTO(rank);
    }

    public RankDTO updateRank(Long id, RankDTO rankDTO) {
        validatePoints(rankDTO);

        Rank rank = rankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rank not found"));

        rank.setTitle(rankDTO.getTitle());
        rank.setAbbreviation(rankDTO.getAbbreviation());
        rank.setMinPoints(rankDTO.getMinPoints());
        rank.setMaxPoints(rankDTO.getMaxPoints());

        Rank updatedRank = rankRepository.save(rank);
        return convertToDTO(updatedRank);
    }

    public void deleteRank(Long id) {
        rankRepository.deleteById(id);
    }

    private void validatePoints(RankDTO rankDTO) {
        if (rankDTO.getMaxPoints() != null &&
                rankDTO.getMinPoints() >= rankDTO.getMaxPoints()) {
            throw new IllegalArgumentException(
                    "Minimum points must be less than maximum points when max is specified"
            );
        }
        // Additional validation if needed
        if (rankDTO.getMinPoints() < 0) {
            throw new IllegalArgumentException("Minimum points cannot be negative");
        }
    }


    private RankDTO convertToDTO(Rank rank) {
        RankDTO dto = new RankDTO();
        dto.setId(rank.getId());
        dto.setTitle(rank.getTitle());
        dto.setAbbreviation(rank.getAbbreviation());
        dto.setMinPoints(rank.getMinPoints());
        dto.setMaxPoints(rank.getMaxPoints());
        return dto;
    }
}