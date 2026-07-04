package com.apurv.collection.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.apurv.collection.entity.Collection;
import com.apurv.collection.entity.Folder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FolderRepository extends JpaRepository<Folder, UUID> {

    List<Folder> findByCollectionAndParentFolderIsNull(Collection collection);

    List<Folder> findByParentFolder(Folder parentFolder);

    Optional<Folder> findByIdAndCollection(UUID id, Collection collection);

}
